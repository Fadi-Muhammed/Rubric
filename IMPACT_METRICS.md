# Rubric — Impact & Success Metrics (PRD §4 / Deck Slide 7)

**Team Pantheon · Challenge 2: CV Matching Bottleneck · Aug 2026**

Every number below is either (a) pure arithmetic that holds for any cohort size, or
(b) computed from our actual demo cohort by `scripts/impact-analysis.mjs`, which runs
the real match engine in `src/data/seed.ts`. Nothing here is invented. Re-run it live:

```bash
npx esbuild src/data/seed.ts --format=esm --outfile=scripts/.seed.mjs
node scripts/impact-analysis.mjs
```

**Honesty boundary — say this out loud if asked.** The demo cohort is 30 synthetic
candidates across 6 host startups, modelled on QSTP's cycle shape. It is not real
applicant data. The *structural* claims (M1, M3) are arithmetic and hold at any N; the
*rate* claims (M2, M4) are measured on the synthetic cohort and must be re-measured
during the Phase 3 pilot. Say "in our demo cohort", not "in practice".

---

## 1. The conventional baseline

Three ways this gets done today, and what each one costs.

| Method | How it works | Structural limit |
|---|---|---|
| **Manual review** (QSTP status quo) | Staff read every application by hand, once per open role | Same CV read N times; screening is subjective and unlogged |
| **Deema** | AI ranks candidates against **one** job description at a time | No shared view across roles — contested picks are invisible until offers collide |
| **Generic ATS** (Greenhouse, Lever, Workday) | Per-requisition pipelines inside **one** company | No concept of one pool feeding many independent host companies |
| **Rigid filters** (GPA ≥ 3.0, keyword match) | Cheap pre-cut before human review | Eliminates strong candidates by proxy, and the rejection is never revisited |

### The core arithmetic

A cycle with **A applicants** and **R roles** costs **A × R** human reviews under a
per-role process, because each role's screen restarts from the full pool. Rubric scores
each applicant against every role in one pass, so humans read **A** applications once and
then review only a ranked top-N per role.

| | Per-role screening | Rubric |
|---|---|---|
| Human CV reads | `A × R` | `A` (once) + `N × R` shortlist reviews |
| QSTP scale (A=150, R=6) | **900 reads** | **150 reads** + 60 shortlist reviews |
| Demo cohort (A=30, R=6) | **180 reads** | **30 reads** ✅ verified |

**83% of all CV reads in a per-role process are duplicates.** That figure is `1 - A/(A×R)`
= `1 - 1/6`. It does not depend on any assumption about reading speed.

### Time sensitivity (the part that *is* an assumption — own it)

Per-CV review time is the one input we cannot measure without QSTP's staff. So don't
defend a single number — defend the fact that **the conclusion is identical across the
whole plausible range**:

| Minutes per considered review | Per-role: 900 reads | Rubric: 60 shortlist reviews |
|---|---|---|
| 2 min | 30 h ≈ 1 week | 2 h |
| 4 min | 60 h ≈ 2 weeks | 4 h |
| 6 min | 90 h ≈ 3 weeks | 6 h |

At one reviewer working 6 productive hours/day. Note the 4-minute row reproduces the
"takes weeks" status quo described in the PRD — that's the model validating itself.
**Whatever you assume, weeks becomes under one working day.**

---

## 2. The three metrics — copy these into PRD §4

### M1 · Screening effort per cycle

| Field | Value |
|---|---|
| **Definition** | Human candidate-role reviews required to produce shortlists for every role in one cycle |
| **Baseline** | 900 reviews (150 applicants × 6 roles) ≈ 60 h ≈ 2 working weeks |
| **Target** | **≥80% fewer reviews** — 150 single-pass reads + ≤10 shortlist reviews per role. **Time from cycle close to delivered shortlists ≤2 working days** (stretch: 1) |
| **How measured** | Count distinct candidate-role reviews logged in Rubric; calendar days from application deadline to shortlists sent |
| **Status** | Structural, verified — 180 → 30 reads on the demo cohort (83%) |

### M2 · Candidates recovered from rigid filters

| Field | Value |
|---|---|
| **Definition** | Strong-fit candidates (fit ≥ 79) who sit below a conventional GPA 3.0 cutoff |
| **Baseline** | **0** — a filter-based process cannot surface them by construction |
| **Measured in demo cohort** | 5 of 30 candidates (17%) are below GPA 3.0. **All 5 rank top-5 for at least one role.** **2 of 6 roles (33%) have a below-cutoff candidate as their #1 ranked match** — Aisha Bousaid (2.8) #1 at Sadeem Robotics, Hassan Ali (2.6) #1 at Baytna IoT. Bilal Nasser (2.5) is #2 at Sadeem |
| **Target** | **≥15% of final shortlist seats** filled by candidates a GPA/keyword filter would have rejected, **and ≥4/5 median startup rating** on shortlist relevance in the post-cycle survey |
| **How measured** | Flag every shortlisted candidate against the counterfactual filter; 3-question survey to each host startup at cycle end |
| **Status** | Rate measured on synthetic data — **must be re-measured in the pilot** |

### M3 · Allocation conflicts

| Field | Value |
|---|---|
| **Definition** | Candidates independently wanted by 2+ startups (a top-5 match for more than one role) |
| **Baseline** | **Unmeasurable today** — with no shared view, nobody can count them until two startups collide over the same person. That gap is itself the finding |
| **Measured in demo cohort** | **5 of 30 candidates (17%) are a top-5 pick for 2+ roles**, flagged by the Allocation Board before any offer goes out |
| **Target** | **100% of contested picks flagged before shortlists are sent**, **zero unresolved double-bookings per cycle**, contested picks resolved in ≤1 review session |
| **How measured** | Allocation Board conflict log; count of post-shortlist reassignments (target: 0) |
| **Status** | Structurally guaranteed — one candidate holds exactly one allocation in the data model |

### M4 · Authenticity coverage *(optional 4th — use only if the slide has room)*

3 of 30 candidates (10%) submitted answers scoring >65% likely AI-generated, and **all 3
rank top-5 for at least one role** — i.e. they reach a shortlist looking strong, and today
nothing tells the reviewer to discount the prose. Target: 100% of shortlisted candidates
carry an authenticity score at review time.

---

## 3. Deck slide 7 — final copy

Template shape is `XX% of X do X within X` against a baseline. Three stats, nothing else
on the slide, big numerals in Fraunces, one accent colour only:

> **83%** — of CV reviews in a per-role process are duplicate reads.
> 900 reads become 150. *Weeks of screening → under one day.*
>
> **1 in 3** — roles has a top-ranked candidate a GPA 3.0 filter would auto-reject.
> 2 of 6 roles in our cohort. *Baseline: those candidates are never seen.*
>
> **17%** — of the pool is wanted by two or more startups at once.
> Flagged before offers go out. *Baseline: invisible until it's a conflict.*

Footnote, small, bottom of slide — do not omit it:
*Measured on a 30-candidate synthetic cohort across 6 host startups; reproducible via
`scripts/impact-analysis.mjs`.*

---

## 4. Things to fix before this ships

Ranked by how badly a judge could hurt you with them.

1. **🔴 Your demo has no real double-booking.** `impact-analysis.mjs` reports **0**
   candidates who are the #1 pick for two roles, and **0 colliding offers** at capacity.
   The seed comment claims "deliberate overlaps (contested picks)" but the ±8 score jitter
   broke it. The Allocation Board still flags 5 contested picks at top-5, so the UI isn't
   empty — but if a judge says *"show me two startups fighting over one person"*, you
   cannot. Nudge two candidates' skills so one person is #1 for two roles. ~5 minutes, and
   it makes the flagship feature actually demonstrate its reason to exist.
2. **🔴 The PRD tech stack is wrong.** It lists shadcn/ui, TanStack Query, react-hook-form
   and zod — **none are installed**. It also says "AI: Claude API"; we ship OpenRouter →
   gpt-4o-mini behind a Supabase Edge Function. Judges read the PRD next to the repo.
   Correct it to: Vite, React 18, TypeScript, Tailwind, framer-motion, react-router-dom;
   Supabase (Postgres + Edge Functions); OpenRouter (gpt-4o-mini); Vercel.
3. **🟡 The demo is 30 candidates; the PRD says 150+.** If a judge opens the app and counts
   30, the headline claim looks unsupported. Either label it "a 30-candidate slice of a
   150-applicant cycle" in the demo, or scale the seed to 150.
4. **🟡 Allocation Board legend is wrong.** `src/pages/Allocation.tsx:274` says contested =
   "top-3 for multiple roles"; the code at line 65 uses **top-5**. One-word fix.
5. **🟡 PRD §4 currently has no numbers at all** — "reduce from weeks to days", "improve
   satisfaction". The brief asked for *measurable* outcomes. Sections 2 above are drop-in
   replacements.
6. **🟢 Team is 3 people** (Fadi, Nihal, Amanda); the deck template has 4 member slots.
   Use 3 and rebalance the layout — an empty fourth card reads as a missing teammate.
