/**
 * Impact analysis — derives the numbers behind PRD §4 / pitch-deck slide 7.
 *
 * Everything here is computed from the actual seed cohort and the actual
 * match engine (src/data/seed.ts), so every figure on the deck can be
 * reproduced live in front of a judge. Run:
 *
 *   npx esbuild src/data/seed.ts --format=esm --outfile=scripts/.seed.mjs
 *   node scripts/impact-analysis.mjs
 */
import { applications, startups, matches } from "./.seed.mjs";

const N = applications.length;
const S = startups.length;
const byApp = new Map(applications.map((a) => [a.id, a]));

/* Rank every startup's pool, best first. */
const ranked = new Map(
  startups.map((st) => [
    st.id,
    matches.filter((m) => m.startupId === st.id).sort((a, b) => b.fitScore - a.fitScore),
  ])
);

const capacity = startups.reduce((t, s) => t + s.capacity, 0);

/* ---- 1. Review volume: per-role screening vs one shared pass ---- */
const perRoleReviews = N * S;

/* ---- 2. Contested picks (invisible to a per-role tool) ---- */
function contestedAt(k) {
  const hits = new Map();
  for (const st of startups)
    for (const m of ranked.get(st.id).slice(0, k))
      hits.set(m.applicationId, (hits.get(m.applicationId) ?? 0) + 1);
  return [...hits.entries()].filter(([, c]) => c > 1);
}
const contested1 = contestedAt(1);
const contested3 = contestedAt(3);
const contested5 = contestedAt(5);

/* Seats that a first-come allocation would leave unfilled: if every startup
   independently offers its top `capacity` picks, how many offers collide? */
const offers = new Map();
for (const st of startups)
  for (const m of ranked.get(st.id).slice(0, st.capacity))
    offers.set(m.applicationId, (offers.get(m.applicationId) ?? 0) + 1);
const doubleBooked = [...offers.values()].filter((c) => c > 1).length;
const collidingOffers = [...offers.values()].reduce((t, c) => t + (c > 1 ? c - 1 : 0), 0);

/* ---- 3. Hidden gems: strong fit, killed by a GPA<3.0 filter ---- */
const gemMatches = matches.filter((m) => m.isHiddenGem);
const gemPeople = new Set(gemMatches.map((m) => m.applicationId));
const belowCutoff = applications.filter((a) => a.gpa < 3.0);

/* Of everyone who ranks top-5 for at least one role, how many are below cutoff? */
const top5People = new Set();
for (const st of startups)
  for (const m of ranked.get(st.id).slice(0, 5)) top5People.add(m.applicationId);
const top5BelowCutoff = [...top5People].filter((id) => byApp.get(id).gpa < 3.0);

/* Best rank each gem achieves */
const gemRanks = [...gemPeople].map((id) => {
  let best = Infinity;
  let where = "";
  for (const st of startups) {
    const i = ranked.get(st.id).findIndex((m) => m.applicationId === id);
    if (i >= 0 && i + 1 < best) {
      best = i + 1;
      where = st.name;
    }
  }
  return { name: byApp.get(id).name, gpa: byApp.get(id).gpa, rank: best, where };
}).sort((a, b) => a.rank - b.rank);

/* ---- 4. Authenticity: polished AI answers that would read as strong ---- */
const likelyAi = applications.filter((a) => a.aiAuthenticityScore > 65);
const likelyAiTop5 = likelyAi.filter((a) => top5People.has(a.id));

/* ------------------------------ report ------------------------------ */
const pct = (n, d) => `${Math.round((n / d) * 100)}%`;
const L = console.log;

L("\n=== COHORT ===");
L(`candidates ................ ${N}`);
L(`host startups ............. ${S}`);
L(`total seats (capacity) .... ${capacity}`);
L(`candidate-role pairs ...... ${matches.length}`);

L("\n=== 1. REVIEW VOLUME ===");
L(`per-role screening ........ ${perRoleReviews} CV reads (${N} x ${S})`);
L(`shared pool ............... ${N} CV reads (scored once, ranked ${S}x)`);
L(`duplicate reads removed ... ${perRoleReviews - N} (${pct(perRoleReviews - N, perRoleReviews)})`);

L("\n=== 2. ALLOCATION CONFLICTS ===");
L(`top-1 contested ........... ${contested1.length} candidates are the #1 pick for >1 startup`);
L(`top-3 contested ........... ${contested3.length}`);
L(`top-5 contested ........... ${contested5.length}`);
L(`double-booked offers ...... ${doubleBooked} candidates hold ${collidingOffers} colliding offer(s)`);
L(`seats at risk ............. ${collidingOffers} of ${capacity} (${pct(collidingOffers, capacity)}) if startups pick independently`);
for (const [id, c] of contested1) L(`   #1 for ${c} startups: ${byApp.get(id).name}`);

L("\n=== 3. HIDDEN GEMS (fit>=79 AND gpa<3.0) ===");
L(`below GPA 3.0 cutoff ...... ${belowCutoff.length} of ${N} candidates (${pct(belowCutoff.length, N)})`);
L(`gem matches ............... ${gemMatches.length} pairs`);
L(`distinct gem candidates ... ${gemPeople.size}`);
L(`top-5 anywhere ............ ${top5People.size} candidates`);
L(`  ...of those, below 3.0 .. ${top5BelowCutoff.length} (${pct(top5BelowCutoff.length, top5People.size)} of shortlist-grade talent)`);
for (const g of gemRanks) L(`   ${g.name} (GPA ${g.gpa}) - rank #${g.rank} at ${g.where}`);

L("\n=== 4. AUTHENTICITY ===");
L(`answers >65% likely AI .... ${likelyAi.length} of ${N} (${pct(likelyAi.length, N)})`);
L(`  ...ranking top-5 ........ ${likelyAiTop5.length} would reach a shortlist unflagged`);
L("");
