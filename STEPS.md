# Rubric — Stepped Build Plan

> **Purpose:** break the Rubric build into small, independently-previewable steps. Each step ends in a state
> you can run (`npm run dev`) and *see* — no half-broken screens — so you can catch errors before moving on.
> **Companion docs:** [`BUILD.md`](./BUILD.md) (full spec — read first) and [`/mockups`](./mockups) (visual reference).
>
> **How to use this file:** for each step, copy the **PROMPT TO SEND** block into a Claude Code chat. After the
> step is built, do the **PREVIEW CHECK**. Only move to the next step once the preview is clean.

---

## Ground rules baked into every step

- **Mock-first data.** Steps 0–9 run on a local, typed seed dataset (`src/data/seed.ts`) behind a data-access
  layer (`src/lib/data.ts`). No Supabase, no API keys, no network — so every step previews instantly and the
  live demo can't break on a bad connection. Supabase + real Claude API are wired **last** (Step 10) and are
  optional for the demo.
- **Every step is previewable.** No step leaves the app unable to boot. New screens are added to the router and
  reachable from the nav or ⌘K as they land.
- **Navigation = hover-expand icon rail** (locked). Hairline left icon rail (~64px) that expands to ~240px with
  labels on hover; icons are Lucide 1.5px; active item marked with the accent. NOT a fat static sidebar.
- **Design system is non-negotiable** — pull tokens from `BUILD.md` §Design System and the `StyleTile` mockup.
  Fraunces for display/big numbers only; General Sans/Satoshi for UI; `#FAFAF7`/`#16161A`/`#2743E0` (light),
  `#0E0E11`/`#F4F4F2`/`#6B82FF` (dark); hairline borders, radius 10–12px, no emoji, skeletons not spinners.
- **Reuse Squire** (`C:\Users\Work\Desktop\aquire`) for shadcn/ui components and the two reusable screens —
  but **never copy `supabase/fixwindowsupdate.bat`** and **never wire real email sending**.
- After each step, **commit** (`git add -A && git commit`) so you have a rollback point per step.

---

## Step 0 — Scaffold + design tokens + shell boots

**Goal:** a running Vite app with the design system wired and an empty app shell that renders in light/dark.

**Builds:** Vite + React 18 + TS project; Tailwind configured with Rubric tokens; fonts (Fraunces + General
Sans/Satoshi) loaded; shadcn/ui initialized; framer-motion + lucide-react + react-router-dom installed;
theme provider (light/dark/system) + a theme toggle; a placeholder route (`/`) showing the wordmark and a
few token swatches to prove the palette/fonts are live.

**PROMPT TO SEND:**
```
Read BUILD.md (esp. the Design System section) and mockups/StyleTile.dc.html. Scaffold the Rubric app:
Vite + React 18 + TypeScript + Tailwind + shadcn/ui + framer-motion + lucide-react + react-router-dom.
Configure Tailwind with the exact Rubric color tokens and radii, load Fraunces (display only) and
General Sans/Satoshi (UI), and add a theme provider supporting light/dark/system with a toggle.
For now just render one route "/" showing the "Rubric" wordmark, a one-line tagline, the theme toggle,
and swatches for canvas/ink/accent + a Fraunces heading and a General Sans paragraph, so I can verify
fonts and colors. Do NOT build any real screens yet. Keep everything mock-first — no Supabase, no API keys.
```

**PREVIEW CHECK:** `npm run dev` → the page renders; fonts look right (serif heading vs sans body); toggling
theme swaps light/dark cleanly; no console errors.

---

## Step 1 — App shell: hover-expand icon rail + routes + StyleTile page

**Goal:** the real navigation chrome and every route registered (screens are stubs for now).

**Builds:** the hover-expand icon rail (collapsed 64px → expand 240px on hover, spring animation, active state,
theme toggle + ⌘K hint pinned at bottom); a top strip with the cycle name/switcher (static for now); the
router with all app routes registered pointing at labeled placeholder screens (Dashboard, Intake Builder,
Match Pool, Allocation Board, Apply, plus a `/style` StyleTile page). The `/style` page renders the full
design system (tokens, type scale, buttons/inputs/badges, the **score dial** component, the **authenticity
badge** component) — this doubles as your component sandbox.

**PROMPT TO SEND:**
```
Build Rubric's app shell. Nav = a hover-expand icon rail (collapsed ~64px, expands to ~240px with labels on
hover using a framer-motion spring; Lucide 1.5px icons; active item uses the accent; theme toggle + a ⌘K hint
pinned at the bottom). Add a slim top strip showing a static cycle name ("Summer 2026 Internship Program")
with a switcher affordance. Register all routes with labeled placeholder screens: /dashboard, /intake,
/match/:startupId, /allocation, /apply/:cycleId, and /style. Build the /style page as a living StyleTile that
renders our tokens, type scale, core shadcn components re-skinned to our system, plus two custom components:
the radial ScoreDial (0–100, count-up animation) and the AuthenticityBadge (green→amber→red diverging scale).
Match mockups/StyleTile.dc.html. Keep mock-first — no data layer yet.
```

**PREVIEW CHECK:** rail expands/collapses smoothly on hover; every nav item routes to its placeholder without
crashing; `/style` shows the ScoreDial animating and the AuthenticityBadge in 3 states; light/dark both clean.

---

## Step 2 — Typed data layer + seed dataset

**Goal:** one realistic seed dataset and a typed access layer everything else reads from.

**Builds:** TypeScript types for `Cycle`, `Startup`, `Application`, `Match`, `Allocation` (per BUILD.md data
model); `src/data/seed.ts` with one cycle, ~6 host startups with distinct needs, ~30 candidates with
realistic-but-fake names/emails/GPAs/skills, and precomputed `matches` (fit_score + fit_reasons +
is_hidden_gem + authenticity_score) so screens have rich data with zero API calls; `src/lib/data.ts`
exposing read/write functions (getCycle, listStartups, listApplications, getMatchesForStartup, etc.) backed
by in-memory state seeded from the file. A tiny `/debug` page (dev-only) dumps counts to prove it loads.

**PROMPT TO SEND:**
```
Create Rubric's mock-first data layer per BUILD.md's data model. Define TS types for Cycle, Startup,
Application, Match (candidate×startup with fit_score, fit_reasons[], is_hidden_gem, authenticity_score,
shortlist_status), and Allocation. Write src/data/seed.ts with ONE cycle, ~6 host startups with clearly
different needs, ~30 candidates (realistic fake names/emails/GPAs/skills/short blurbs), and a precomputed
matches array so every startup has a ranked candidate list including 2–3 hidden gems and a spread of
authenticity scores. Build src/lib/data.ts with typed read/write functions backed by in-memory state seeded
from that file (writes update memory so the UI feels live). Add a dev-only /debug page that prints record
counts. No Supabase, no network.
```

**PREVIEW CHECK:** `/debug` shows expected counts (1 cycle, ~6 startups, ~30 candidates, matches present);
no type errors (`npm run build` passes).

---

## Step 3 — Recruiter Dashboard

**Goal:** the landing workspace — open roles + live stats — reading real seed data.

**Builds:** `/dashboard` per the Dashboard mockup: header with cycle name + primary action; a stats row
(candidates, startups, shortlisted, unallocated) with count-up numbers; a grid of host-startup cards (name,
need summary, applicant count, top-match preview) that link into the Match Pool; staggered ~35ms card
entrance; skeleton loading state.

**PROMPT TO SEND:**
```
Build the /dashboard screen from mockups/Dashboard.dc.html, reading from src/lib/data.ts. Show the cycle
header + primary CTA, a stats row (total candidates, host startups, shortlisted, unallocated) with count-up
animation, and a responsive grid of host-startup cards (name, one-line need, applicant count, best-match
preview) that each link to /match/:startupId. Add ~35ms staggered card entrance and a skeleton loading state
(not a spinner). Honor prefers-reduced-motion. Light/dark both.
```

**PREVIEW CHECK:** `/dashboard` shows seeded stats + startup cards; numbers count up; cards route to a (still
placeholder) match screen; skeletons flash on load.

---

## Step 4 — Public Apply Page (the candidate side)

**Goal:** a candidate can fill and submit the single shared-pool application; it lands in the pool.

**Builds:** `/apply/:cycleId` per the ApplyPage mockup — a calm, single-column application form (name, email,
GPA/semester, skills, short-answer questions, resume upload as a mock file input) reading the cycle's
`form_config`; client validation; on submit, write a new Application via the data layer and show a clean
confirmation state. This is what feeds the pool in the demo.

**PROMPT TO SEND:**
```
Build the public /apply/:cycleId page from mockups/ApplyPage.dc.html. Render the cycle's application form
(name, email, GPA, semester, skills, 2–3 short-answer questions, a mock resume file input) from the cycle's
form_config in the data layer. Validate on the client. On submit, create a new Application via src/lib/data.ts
(and a placeholder Match row so the candidate appears in pools) and show a polished confirmation state. Keep
it single-column, editorial, unauthenticated. No real upload/network.
```

**PREVIEW CHECK:** fill the form → submit → confirmation shows; the new candidate count increments on
`/dashboard` and `/debug`.

---

## Step 5 — Match Pool (HERO screen)

**Goal:** the signature moment — ranked candidates for one startup with score dials + fit reasons.

**Builds:** `/match/:startupId` per the MatchPool mockup — ranked candidate rows for the selected startup,
each with a ScoreDial (count-up), name/summary, top fit reasons, authenticity badge, and a shortlist toggle;
staggered "reveal" entrance (the AI Match Reveal hero moment); filter/sort controls with layout-animated
reflow; Hidden Gem markers on flagged rows. Rows are click-targets for Step 6's drawer.

**PROMPT TO SEND:**
```
Build the /match/:startupId Match Pool from mockups/MatchPool.dc.html — this is the hero screen. For the
selected startup, render its ranked candidate list from getMatchesForStartup(): each row has the radial
ScoreDial (count-up), candidate name + one-line summary, 2–3 fit_reasons, an AuthenticityBadge, a Hidden Gem
marker when is_hidden_gem, and a shortlist toggle that persists via the data layer. Add the staggered "AI
Match Reveal" entrance (~35ms stagger, dials counting up) and filter/sort controls (by score, hidden gems,
authenticity) with framer-motion layout-animated reflow. Rows should be prepared as click targets for a
detail drawer (next step). Honor prefers-reduced-motion; skeletons on load.
```

**PREVIEW CHECK:** `/match/<a real startupId>` reveals a ranked list; dials animate; sorting/filtering reflows
smoothly; hidden gems flagged; shortlist toggle sticks when you navigate away and back.

---

## Step 6 — Candidate Drawer (shared-element transition)

**Goal:** click a row → it expands into a detail drawer using a shared-element transition.

**Builds:** the CandidateDrawer per its mockup — a right-side drawer with full candidate detail (answers,
skills, per-startup fit breakdown, authenticity), opened from a Match Pool row via `layoutId` shared-element
animation; shortlist action inside; ESC/overlay close. This is the other "Apple-grade" motion beat.

**PROMPT TO SEND:**
```
Build the CandidateDrawer from mockups/CandidateDrawer.dc.html. Clicking a Match Pool row opens a right-side
drawer with full candidate detail (short-answer responses, skills, the fit_reasons breakdown, ScoreDial,
AuthenticityBadge, resume placeholder) using a framer-motion shared-element (layoutId) transition from the
row. Include the shortlist toggle inside the drawer (syncs with the row). Close on ESC and overlay click.
Honor prefers-reduced-motion (fall back to a simple fade).
```

**PREVIEW CHECK:** clicking a row animates it into the drawer; detail matches the candidate; shortlist state
stays in sync between drawer and row; ESC closes.

---

## Step 7 — Intake Builder + AI writing assistant (mocked AI)

**Goal:** the recruiter can build/configure the cycle's intake, with the AI-assist buttons working (mocked).

**Builds:** `/intake` per the IntakeBuilder mockup — the 3-step flow (details → form/question builder →
publish + shareable link). Adds the two AI features as buttons: **"Improve with AI"** (elaborates a startup
role description) and **"Suggest questions"** (proposes screening questions). In this step both are backed by
a **mock** async function returning canned-but-convincing output with a loading state — so the UX is real and
demoable without an API key. (Real Claude wiring comes in Step 10.)

**PROMPT TO SEND:**
```
Build the /intake Intake Builder from mockups/IntakeBuilder.dc.html: a 3-step flow (1: cycle + per-startup
details, 2: application form + screening-question builder, 3: publish with a generated shareable /apply link).
Persist config to the data layer. Add two AI-assist buttons: "Improve with AI" on a role description and
"Suggest questions" on the question builder. For now back both with a MOCKED async helper (src/lib/ai.ts)
that returns convincing canned output after a short delay with a proper loading state and an accept/insert
action — no real API calls yet. Match our design system and motion.
```

**PREVIEW CHECK:** step through all 3 sub-steps; "Improve with AI" and "Suggest questions" show loading then
insert plausible content; publishing yields a copyable `/apply/:cycleId` link that actually opens Step 4.

---

## Step 8 — Shortlist / Reject-all + mocked Outlook email preview

**Goal:** the shortlist workflow and the one-click "reject all non-shortlisted" with a simulated email step.

**Builds:** shortlist filtering on the Match Pool; a **"Reject all (keep shortlisted)"** action (reused
concept from Squire's ViewApplications) that opens a confirmation showing an **email preview** to the rejected
candidates and, on confirm, marks them rejected and shows a **simulated** "emails sent" success. Framed in-UI
as a future Outlook integration (via composio.dev) — **nothing is actually sent.**

**PROMPT TO SEND:**
```
Add the shortlist/reject workflow. On the Match Pool, allow filtering to shortlisted-only, and add a
"Reject all (keep shortlisted)" button (adapt the logic from Squire's ViewApplications.tsx at
C:\Users\Work\Desktop\aquire). It opens a confirmation dialog that previews a rejection email to each
non-shortlisted candidate (real-looking seeded addresses) with a note that this will connect to Outlook via
composio.dev in future. On confirm, mark those candidates rejected via the data layer and show a SIMULATED
"N emails sent" success state. Do NOT send any real email or make any network call — it is mocked on purpose.
```

**PREVIEW CHECK:** shortlist a few, click Reject all → preview lists the correct rejected candidates → confirm
→ simulated success; rejected candidates drop from the active list. No network request fires.

---

## Step 9 — Allocation Board (HEADLINE wow) + ⌘K command palette + polish

**Goal:** the marquee feature — one-click assignment of the whole pool across all startups — plus ⌘K.

**Builds:** `/allocation` — a board with startups as columns; a **"Auto-allocate"** button runs a **greedy/
seeded** assignment (best available fit per startup, no candidate double-booked) and animates candidates into
columns; contested candidates (wanted by multiple startups) are highlighted; drag a candidate to override an
assignment (framer-motion layout animation). **Not a real optimizer** — greedy is fine and honest. Then add
the **⌘K command palette** (per its mockup) as the primary nav/search, and a final motion/polish pass. Add a
**Hidden Gems** view/filter surfacing flagged candidates across the pool.

**PROMPT TO SEND:**
```
Build the /allocation Allocation Board — our headline feature. Startups are columns. An "Auto-allocate" button
runs a greedy/seeded assignment (each startup gets its best AVAILABLE fit, no candidate assigned twice) and
animates candidates into their columns with a staggered reveal. Highlight contested candidates (top fit for
multiple startups). Support drag-to-override with framer-motion layout animation, persisting via the data
layer. Do NOT build a real optimizer — greedy is intended. Then add the ⌘K command palette from
mockups/CommandPalette.dc.html (navigate to any screen/startup, quick actions, fuzzy search) and wire the
rail's ⌘K hint to it. Add a Hidden Gems filter/view across the pool. Final motion/polish pass; honor
prefers-reduced-motion.
```

**PREVIEW CHECK:** `/allocation` → Auto-allocate fills columns with no duplicates; contested highlighted;
dragging a candidate reassigns cleanly; ⌘K opens and navigates everywhere; hidden gems surface.

---

## Step 10 (OPTIONAL, LAST) — Wire real backend: Supabase + Claude API

**Goal:** swap the mock layer for real persistence + real AI, without changing any screen.

**Builds:** a Supabase project (schema from BUILD.md), swap `src/lib/data.ts` internals from in-memory to
Supabase (same function signatures, so screens don't change); move the AI helpers in `src/lib/ai.ts` to call
**Claude server-side** (Supabase Edge Function) for matching, authenticity scoring, "Improve with AI," and
"Suggest questions" — keys in env, never committed. Keep the mock layer behind a flag so the demo can fall
back instantly if the network fails.

**PROMPT TO SEND:**
```
Wire the real backend WITHOUT changing any screen. Create the Supabase schema from BUILD.md and reimplement
src/lib/data.ts against Supabase keeping the exact same function signatures. Move src/lib/ai.ts to call Claude
via a Supabase Edge Function for: candidate×startup matching (fit_score + fit_reasons), authenticity scoring,
"Improve with AI," and "Suggest questions." Keep all keys in .env (already gitignored) — never commit secrets.
Keep a VITE_USE_MOCK flag that falls back to the in-memory seed layer so the live demo can't break on a bad
connection. Deploy target: Vercel/Netlify (SPA). Do NOT wire real email.
```

**PREVIEW CHECK:** flip the flag to real → data persists across reloads; AI buttons return live output; flip
back to mock → identical UI. Deploy and confirm the public URL loads for the `TeamName_DemoLink.txt`.

---

## Suggested stopping points (brutal-honesty note)

Submission is **tonight, 11:59 PM**. You do **not** need all 11 steps to submit — and every step is a clean
stopping point that demos.

- **Minimum demoable spine:** Steps 0–5 (scaffold → shell → data → dashboard → apply → Match Pool). That alone
  tells the shared-pool story with the hero reveal.
- **Strong submission:** through Step 9 on the **mock layer** — Allocation Board + ⌘K is your differentiator
  and it demos perfectly on seed data. A polished mock-backed prototype beats a half-wired real backend.
- **Only do Step 10 if you have real time to spare.** Judges see 25% feasibility; a flawless mock demo scores
  that fine. A broken live API on stage does not.

Build in order, commit after each step, and stop wherever the clock forces you — you'll still have something
that runs.
