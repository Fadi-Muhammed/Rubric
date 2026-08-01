# Rubric — Build Specification & Handoff Doc

> **Purpose of this file:** the single source of truth for building **Rubric**. It is written so a fresh
> Claude Code session (or a new teammate) can read *only this file* and start building with full context.
> If you are a new agent: read this top-to-bottom before touching code. Companion reference: the visual
> mockups in [`/mockups`](./mockups) (open the `.dc.html` files in a browser; `support.js` sits alongside).

---

## 0. TL;DR (read this first)

- **What:** Rubric is a recruiting product for the **QSTP Internship Program** that turns **one shared pool
  of intern applicants** into a **ranked, conflict-free shortlist for each of many host startups** — using AI
  matching. It is NOT a single-company ATS.
- **Why it's different:** neither Deema (ranks resumes for one JD at a time) nor Greenhouse (one company)
  handles *one shared pool matched across dozens of startups with different needs at once.* That gap is the moat.
- **Headline features:** (1) **Allocation Board** — one-click optimal assignment of the pool across all
  startups, no double-booking. (2) **Hidden Gems** — surfaces strong candidates a naive GPA/keyword filter
  would reject.
- **Stack:** Vite + React 18 + TypeScript + Tailwind + shadcn/ui + Supabase + framer-motion + Claude API.
- **Reuse:** heavily adapt the prior project **Squire** (`C:\Users\Work\Desktop\aquire`) — same stack, has a
  full shadcn/ui set and two directly-reusable screens. **Disclose Squire as pre-existing IP** in PRD/pitch.
- **Deadline:** **Sat 1 Aug, 11:59 PM** (submission). Final pitches **Sun 2 Aug, 4 PM**.
- **The bar:** UX "smoother than Apple," not a generic vibe-coded app. Design is a top judging axis.

---

## 1. Hackathon context

- **Event:** QSTP "BUILD FOR QSTP" Internship Program Hackathon (48h). Comms on Discord.
- **Challenge 2 — "CV Matching Bottleneck":** Each cycle 150+ candidates are reviewed manually (weeks of
  work). Filtering is subjective → qualified candidates get missed and host startups get poor-fit shortlists.
- **Success looks like:** faster screening, smarter matching, higher startup satisfaction, higher
  hire-to-conversion, scales as the program grows.
- **Landscape gaps (from the brief):**
  - *Deema Recruitment* — the AI resume-ranking tool QSTP currently uses. Its CEO **Ahmed Aqel** names its
    current gaps live in the workshop; the solution should start from what he says isn't working. He mentors
    **Sat 12–2 PM** — attend and adjust emphasis (not architecture) after.
  - *Greenhouse* — single-company ATS; **no concept of matching one shared pool across many host startups.**
    ← This sentence is the whole opportunity.
- **Two source docs** behind this build: the QSTP Participant Guidebook (framing + rules + judging) and the
  Deema ATS Hackathon Brief (the concrete "extend Deema into a full ATS" ask). Rubric = the ATS ask,
  re-angled around the shared-pool-to-many-startups gap.

## 2. Hard constraints (do not violate)

### Deliverables — ALL FOUR required or the submission is INVALID
1. **PRD** — on the official template (from Discord), filled exactly: problem, solution, user stories, scope.
2. **Working prototype / MVP** — must *demonstrate* solving the problem, not a static mockup.
3. **Pitch deck** — on the official template, no exceptions.
4. **Pitch video** — max **2 minutes**; must explain problem + solution (not just a product demo).

File naming: `TeamName_Deck.pdf`, `TeamName_Roadmap.pdf`, `TeamName_DemoLink.txt`.

### Judging — 4 criteria, equal 25% each
| Criterion | Weight | Implication |
|---|---|---|
| Feasibility | 25% | Only a quarter of the score is "how much you built." |
| Impact | 25% | Solve the *real* QSTP pain (150+ manual reviews, poor-fit shortlists). |
| Presentation | 25% | Deck + 2-min video + live pitch (2 min + 3 min Q&A). |
| Innovation & Sustainability | 25% | Novelty + can it scale/extend. |

**Strategic consequence:** this is a pitch contest with a prototype attached, *not* a build contest. Scope the
build DOWN; protect real time for PRD + deck + video. A polished, well-pitched narrow prototype beats a
sprawling half-working one.

### Timeline
- Fri 31/7 — free build day. Sat 1/8 10:00 teams arrive; 12–2 mentorship (Ahmed Aqel); 2–3 pitching
  workshop; **23:59 submission**. Sun 2/8 16:00 final pitches & judging.

## 3. Product vision & core model

**Rubric runs one program intake (a "cycle") with ONE public application link. Candidates apply once.
Host startups and their needs live inside the cycle. Rubric matches every candidate against every startup.**

This single-intake / shared-pool model (vs per-job links) is the differentiating architecture. Keep it central
in the product and the pitch.

### Actors
- **Recruiter** = the QSTP Internship Program team. Primary user. Runs the cycle, reviews, allocates, exports.
- **Host startup** = an entity/profile with hiring needs, managed by the recruiter. (An optional read-only
  startup portal is **roadmap only** — do not build for 48h.)
- **Applicant / Candidate** = an intern applicant. Applies once to the program via the public link.

## 4. Full functionality list (priority-tagged)

**Legend:** 🟢 Must-have (demo spine) · 🔵 Wow (differentiator) · 🟡 Bonus (polish) · ⚪ Mock/roadmap only

### A. Cycle & startup setup (recruiter)
- 🟢 Create a hiring cycle (e.g., "Summer 2026 Internship Program")
- 🟢 Add host startups, each with role title + needs / mini-JD + employment type (Internship/Full-time/Contract)
- 🟡 "Improve with AI" — one click to elaborate/polish a startup's role description
- 🟡 "Suggest questions" — auto-suggest screening questions from a selected role description

### B. Application form builder (recruiter)
- 🟢 Toggle which applicant fields are required (Full name, Email, Nationality, Country of residence, Phone, …)
- 🟢 Resume upload = ALWAYS required; Cover letter = optional toggle
- 🟢 Add free-text screening questions — become mandatory for applicants once added
- 🟢 Review → publish → generate the single public application link
- 🟡 AI-suggested screening questions panel (see A)

### C. Public application page (candidate)
- 🟢 Clean public form: enabled fields, screening questions, resume dropzone (required), optional cover-letter
- 🟢 Apply once to the program (not per startup)
- 🟢 Submit → confirmation ("You're in the pool")

### D. Matching engine (core — Deema's capability, re-implemented via Claude)
- 🟢 Parse each resume + answers
- 🟢 Score each candidate against EACH startup's needs → fit % + bullet fit-reasons
- 🟢 Runs on submission; dashboard shows candidates already ranked per startup

### E. Review & shortlisting (recruiter)
- 🟢 Per-startup ranked shortlist with fit reasons
- 🟢 Filters + bulk shortlist/reject + "Reject All (keep shortlisted)" (REUSE from Squire `ViewApplications`)
- 🟢 Candidate detail drawer: resume preview, answers, fit reasons, authenticity badge
- 🔵 **Hidden Gems** — flag high-fit candidates a naive GPA/keyword filter would have cut

### F. Cross-startup allocation (headline wow)
- 🔵 **Allocation Board** — one-click optimal assignment of the pool across all startups, no double-booking;
  contested candidates highlighted; drag to override. (Greedy/seeded — NOT a real optimizer.)

### G. Integrity & authenticity (bonus)
- 🟡 AI-authenticity "% written by AI" score per candidate (color-coded green→red) + short rationale
- 🟡 Threshold slider to hide/flag applicants above X%

### H. Dashboard, export, comms, polish
- 🟢 Metrics: total applicants, cover-letter count, new today (per cycle / per startup)
- 🟢 Copy/share the public link
- 🟢 Export: per-applicant PDF (details + resume + cover letter + answers) bundled as ZIP; export a shortlist
- 🟢 Shortlist/reject workflow (see E)
- ⚪ "Notify rejected applicants via Outlook" — MOCK only: preview + simulated success toast, framed as future
  **composio.dev → Outlook** integration. NEVER actually send email (seed data has real-looking addresses).
- 🔵 ⌘K command palette (craft signal; cmdk already in Squire)
- 🟢 Light/dark themes + full motion system
- ⚪ LinkedIn "Post opening now" — MOCK only (connected status + success toast)
- ⚪ Two-sided view (candidate → best-fit startups) — only if spine is done; nearly free (reads existing scores)
- ⚪ Startup self-service portal, feedback loop / model retraining — ROADMAP SLIDE ONLY

## 5. The two wow features (detailed)

### 5.1 Allocation Board 🔵 (the headline)
**Problem it solves:** one strong candidate is the #1 pick for several startups — who gets them? Manual pools
can't resolve this; it's the exact gap in the landscape table.

**UX:** a board with **host startups as columns**; proposed candidate assignments slotted under each; contested
candidates (top pick for >1 startup) highlighted; **drag to override**; a summary bar ("40 candidates · 12
startups · 0 conflicts · avg fit 87%"). One **"Auto-allocate"** button runs the assignment with animation.

**Algorithm guardrail:** do NOT build a real solver. A **greedy** pass (sort candidate×startup matches by fit
desc; assign each candidate to their best still-open startup slot; respect per-startup capacity) is enough —
or precompute assignments on seed data. It looks identical in a 2-minute demo.

**Demo line:** *"40 candidates, 12 startups — one click, optimal allocation, every startup gets its best
available fit, zero conflicts."* Hits Innovation + Impact hardest.

### 5.2 Hidden Gems 🔵
**Problem it solves:** QSTP's stated pain — "subjective filtering, qualified candidates get missed."

**UX:** a candidate is flagged **"Hidden Gem"** (a badge + one-line reason) when they have **high AI fit** but
would **fail a naive filter** (e.g., below the GPA cutoff or missing a keyword). Show it in the shortlist and
drawer.

**Cost:** near-zero — you already computed fit scores; a hidden gem = `fit >= high_threshold AND
would_fail_naive_filter`. It's a badge + a sentence, not a subsystem.

**Demo line:** *"Our old tool would've cut this person on GPA. Rubric surfaces them as a top-3 fit — here's why."*
Perfect before/after against Squire's manual-filter model. Hits Impact + Presentation.

## 6. AI features (Claude API)

**All Claude calls are server-side** (Supabase Edge Function or a small serverless route) so the API key never
reaches the browser. Cache results in the DB (don't re-call on every render).

| Feature | Input | Output | Notes |
|---|---|---|---|
| **Matching** (D) | startup needs + candidate resume + answers | `fit_score` 0–100 + `fit_reasons[]` | Run per candidate × startup on submit. |
| **Authenticity** (G) | resume text + free-text answers | `ai_score` 0–100 + short rationale | Assess AI-generation markers (uniform tone, generic phrasing, low specificity). Diverging green→red scale. |
| **Improve with AI** (A) | role description text | polished description | Show diff/accept. |
| **Suggest questions** (A/B) | a selected role description | 3–5 screening questions | Recruiter clicks to add. |

**Prompt sketches** (refine during build; keep outputs strict JSON):
- *Matching:* "Given this startup's needs and this candidate's resume + answers, score fit 0–100 and give 3
  concise, specific reasons. Return JSON `{score, reasons:[...]}`. Be strict; reward specific evidence."
- *Authenticity:* "Estimate the probability this text was AI-generated (0–100) from tone uniformity, generic
  phrasing, and lack of specific detail. Return JSON `{score, rationale}`. Do not penalize good grammar alone."

**Honest note:** AI ranking is baseline (Deema already does it) — it is table stakes, not the wow. The wow is
what you do *with* the scores (Allocation, Hidden Gems).

## 7. User journeys (A→Z)

### Recruiter
1. Log in to the Rubric dashboard.
2. Create a cycle — "Summer 2026 Internship Program."
3. Add host startups + needs (optionally sharpen each with "Improve with AI").
4. Build the application form — required fields, resume required, cover-letter toggle, add screening questions
   (accept a few AI suggestions).
5. Review & publish → Rubric generates ONE public link.
6. Share the link (copy button).
7. Applications flow in → dashboard stats climb (total / cover-letters / new today).
8. Rubric auto-matches every applicant against every startup (no manual screening).
9. Open a startup's shortlist — ranked candidates, fit reasons, authenticity badges; **Hidden Gems** flags the
   strong candidate a GPA filter would've missed.
10. Refine — filter, bulk shortlist/reject, open a candidate drawer to read resume + answers.
11. Run the **Allocation Board** — one click assigns the whole pool across all startups, no conflicts; drag to
    override a contested pick.
12. Export — a startup's shortlist as a ZIP of applicant PDFs.
13. (Mock) Reject-all-non-shortlisted with optional "Notify rejected via Outlook (Composio)" — preview +
    simulated success. (Mock) "Post opening to LinkedIn."

### Applicant
1. Open the single public link.
2. See the program — cycle title, what it is, employment type, what's asked.
3. Fill the form — required fields marked with *.
4. Answer screening questions (mandatory).
5. Upload resume (required) + cover letter (if enabled).
6. Submit → clean confirmation ("You're in the pool").
7. *(Behind the scenes)* Rubric parses, scores against every startup, runs authenticity, flags Hidden Gems —
   the candidate applies once and is considered for every fitting startup.

## 8. Tech stack

- **Frontend:** Vite + React 18 + TypeScript, React Router, Tailwind, shadcn/ui (Radix), framer-motion (motion),
  TanStack Query, react-hook-form + zod, lucide-react, sonner (toasts), cmdk (command palette), recharts.
- **Backend/data:** Supabase (Postgres + JS client). AI calls via **Supabase Edge Function** (server-side key).
- **AI:** Claude API (Anthropic).
- **Deploy:** Vercel or Netlify (SPA) — a live URL is required for the `DemoLink` deliverable and for the public
  application link. Deploy EARLY.

**Why not Next.js:** Squire is already Vite + Supabase + shadcn; reuse + familiarity + a fixed 1.5-day window
beat a greenfield framework. SPA deploy gives the public URL; Edge Functions keep the AI key server-side.

## 9. Reuse from Squire

**Location:** `C:\Users\Work\Desktop\aquire` (Vite + React + TS + shadcn, Lovable-scaffolded).
**Reality check:** most of Squire's data flow is MOCK (hardcoded arrays; `CreateJobListing` doesn't persist;
`ViewApplications` reads a `Student_users` table that doesn't exist; auth is `localStorage`). Reuse the **UI and
interaction patterns**, not the backend.

**Disclose Squire as pre-existing IP in the PRD and pitch** ("accelerated on our own prior project Squire").
The hackathon rules require disclosure of pre-existing IP; the *innovation* (shared-pool matching + Allocation
Board + Hidden Gems) is built in-window.

| Lift | From | Into Rubric as |
|---|---|---|
| Entire `src/components/ui/*` (~50 shadcn components) | Squire | Rubric's component library (re-skin tokens hard) |
| `src/pages/ViewApplications.tsx` (table, filters, bulk shortlist/reject, "Reject All keep shortlisted", missing-docs highlight, summary cards) | Squire | Per-startup shortlist screen (add fit score, fit reasons, Hidden Gem badge, authenticity) |
| `src/pages/CreateJobListing.tsx` (title, desc, requirements, required-docs checkboxes, GPA, deadline calendar, semester, notify toggle) | Squire | Cycle/startup setup + form builder |
| Summary stat cards pattern | Squire | Dashboard metrics |
| Status pipeline (under_review/shortlisted/rejected) + color coding | Squire | Shortlist states |

**Concept mapping:** Squire `departments` → Rubric **host startups**.
**Do NOT copy:** `TimesheetManagement`, `HiredAssistants` (that's post-hire ops = Challenge 3), and Squire's
hand-rolled bcrypt auth (use Supabase Auth or a demo login).
**Security flag:** Squire contains `supabase/fixwindowsupdate.bat` — an out-of-place Windows batch file. Do NOT
run it and do NOT copy it into Rubric.

## 10. Data model (Supabase / Postgres)

Extend Squire's schema. Proposed tables:

```
cycles            id, name, status(draft|live|closed), public_slug, created_at
startups          id, cycle_id → cycles, name, role_title, needs_description, employment_type, capacity, created_at
form_config       id, cycle_id → cycles, required_fields (jsonb), cover_letter_enabled (bool)
screening_qs      id, cycle_id → cycles, text, sort_order
applications      id, cycle_id → cycles, field_values (jsonb), resume_url, cover_letter_url,
                  answers (jsonb), ai_authenticity_score (int), ai_authenticity_rationale (text), created_at
matches           id, application_id → applications, startup_id → startups, fit_score (int),
                  fit_reasons (jsonb), is_hidden_gem (bool), shortlist_status(under_review|shortlisted|rejected)
allocations       id, cycle_id → cycles, application_id → applications, startup_id → startups, status
```

Notes:
- `matches` is the candidate×startup grid — the heart of Rubric. Shortlist status lives here (per startup).
- `is_hidden_gem` computed at match time: `fit_score >= HIGH AND would_fail_naive_filter(application)`.
- `allocations` = the Allocation Board's final assignment (one row per assigned candidate).
- For the demo, a real Supabase backend is ideal but the flow can be seeded/mocked if time runs short — the
  product experience is what's judged.

## 11. Screens / routes (map to mockups in `/mockups`)

| Route (proposed) | Screen | Mockup file |
|---|---|---|
| `/` or `/login` | Recruiter auth / landing | — |
| `/dashboard` | Recruiter dashboard (cycles + stats) | `Dashboard.dc.html` |
| `/cycle/:id/build` | Intake builder (3 steps: details → form → publish) | `IntakeBuilder.dc.html` |
| `/cycle/:id/startup/:sid` | Per-startup ranked shortlist (Hidden Gems, filters, bulk actions) | `MatchPool.dc.html` |
| (drawer) | Candidate detail | `CandidateDrawer.dc.html` |
| `/cycle/:id/allocate` | **Allocation Board** | (design next — not yet mocked) |
| `/apply/:slug` | Public candidate application | `ApplyPage.dc.html` |
| (overlay) | ⌘K command palette | `CommandPalette.dc.html` |
| — | Design system reference | `StyleTile.dc.html` |

**Note:** the Allocation Board is the one hero screen not yet in the mockups — design it next (it's the highest
-leverage remaining design task).

## 12. Design system (locked — source of truth is `mockups/StyleTile.dc.html`)

**Bar:** "smoother than Apple," unique but calm, easy to use, NOT generic vibe-coded. Design is a top judging axis.
**Brand concept:** "the living rubric" — ranked rows + a signature **radial score dial**.

- **Palette (light):** canvas `#FAFAF7` (warm off-white, not pure white); surface `#FFFFFF`; ink `#16161A`;
  secondary ink `#6B6B72`; hairline border `rgba(0,0,0,0.08)`.
- **Palette (dark):** canvas `#0E0E11`; surface `#17171B`; elevated `#1E1E24`; ink `#F4F4F2`;
  secondary `#A0A0A8`; hairline `rgba(255,255,255,0.09)`.
- **Accent (actions only):** `#2743E0` (light) / `#6B82FF` (dark). Single accent; used sparingly.
- **AI-authenticity score scale:** diverging **green (human) → amber → red (AI)** — a DIFFERENT hue from the
  accent so nothing clashes.
- **Type (mix cleanly):** **Fraunces** (serif) for display/headlines/big numbers ONLY, never UI chrome;
  **General Sans / Satoshi** for all UI/body. Scale: 12/14/16/20/28/40/56; tight tracking at 28px+.
- **Radius:** 10–12px standard / 14px large surfaces / full for pills & the dial. Held consistent.
- **Depth:** hairline borders + ONE soft ambient shadow. No heavy/stacked shadows, no glassmorphism.
- **Spacing:** strict 4/8pt grid; generous whitespace; max-width content columns.
- **Icons:** Lucide, 1.5px stroke, consistent sizing. **No emoji.**
- **Themes:** light + dark + system, with a smooth toggle.

**Motion (framer-motion — where "Apple-smooth" is earned):**
- Springs only (~stiffness 300, damping 30). No linear/ease tweens.
- Shared-element transitions (`layoutId`): a candidate ROW expands into the detail DRAWER.
- Ranked list appears with ~35ms staggered entrance.
- Score dials + stat numbers COUNT UP.
- Filtering animates layout (smooth reflow, never a hard jump) — critical for the authenticity slider.
- Skeletons that match final layout (no spinners); optimistic UI; press states scale 0.98.
- Transform/opacity only (60fps); honor `prefers-reduced-motion`.

**Kill-list (these read as generic AI-app — do NOT do):** violet/indigo primary, default Inter, default shadcn
card shadows, mesh/gradient blob backgrounds, center gradient hero headline, glassmorphism everywhere,
rounded-2xl-everything, ✨/emoji icons, spinners, default browser focus rings, lorem ipsum (use realistic QSTP
content — intern roles, host-startup names, candidate names).

## 13. Seed / demo data

Build a convincing seeded cycle so the demo is instant and impressive:
- 1 cycle: "Summer 2026 Internship Program."
- ~10–12 host startups with distinct needs (e.g., React frontend intern, ML/data intern, growth/marketing
  intern, hardware intern…).
- ~40 candidates with varied, realistic resumes + answers so matching, contested picks, and at least 2–3
  Hidden Gems appear naturally.
- Pre-compute matches so the Match Reveal and Allocation Board run instantly on stage.

## 14. Build order (ruthless — the spine first)

1. **Scaffold** Vite + TS + Tailwind + shadcn; copy Squire `components/ui`; re-skin design tokens; deploy to
   Vercel immediately (get the live URL early).
2. **Data + seed:** Supabase schema (§10) + seed data (§13). (Or mock a data layer if time is tight.)
3. **Spine:** Intake builder (B) → Public apply (C) → auto-match on submit (D) → per-startup shortlist (E).
4. **Wow #1:** Allocation Board (F) — design the screen, then greedy assignment + drag override.
5. **Wow #2:** Hidden Gems badge inside E (cheap).
6. **Bonus (only if spine solid):** Improve-with-AI + Suggest-questions (A); authenticity % + slider (G).
7. **Polish:** ⌘K, dashboard export/ZIP, Outlook + LinkedIn mocks, empty/loading states, dark mode parity.
8. **Freeze build early Sat afternoon.** Then PRD + deck + 2-min video + practice the pitch.

## 15. Scope guardrails / traps to avoid

- **Don't out-build the pitch.** 75% of the score isn't code. Protect PRD/deck/video time.
- **Don't build a real optimizer** for allocation — greedy/seeded.
- **Don't send real emails** or wire real LinkedIn/Outlook/Composio — mock them.
- **Don't rebuild the AI ranker as your headline** — it's baseline; the wow is Allocation + Hidden Gems.
- **Don't copy Squire's timesheets/hired-assistants** (Challenge 3 scope) or its bcrypt auth.
- **Don't uniformly over-polish** — nail 2–3 hero moments (Match Reveal, Allocation Board), keep the rest quiet.

## 16. Deliverables checklist

- [ ] PRD (official template) — problem, solution, user stories, scope; disclose Squire reuse.
- [ ] Working prototype — deployed, seeded, demoable (spine + both wow features).
- [ ] Pitch deck (official template).
- [ ] Pitch video (≤2 min; problem + solution, not just a demo).
- [ ] `TeamName_DemoLink.txt` (the live URL).
- [ ] Practice the 2-min pitch + prep 3-min Q&A ("how does it scale across startups?", "how accurate is the AI
      score?", "did you build this in 48h?" → honest Squire-reuse answer).

## 17. Repo & environment

- **Repo:** `https://github.com/Fadi-Muhammed/Rubric` (private; GitHub account `Fadi-Muhammed`; gh CLI authed).
- **Working dir:** `C:\Users\Work\Desktop\Rubric QSTP`.
- **Mockups:** `./mockups/*.dc.html` (+ `support.js`). See `mockups/README.md`.
- **Squire source (reuse):** `C:\Users\Work\Desktop\aquire`.
- **Secrets:** put the Claude API key + Supabase keys in env / Edge Function config — never commit them
  (`.gitignore` already excludes `.env*`).

## 18. Open decisions (revisit after the Sat mentor session)

- Exact gaps Ahmed Aqel (Deema CEO) names live — start from those; adjust emphasis, not architecture.
- Real Supabase backend vs seeded/mock data layer (depends on time left after the spine).
- Screening questions: suggest from the cycle's combined roles vs a recruiter-selected role (currently:
  recruiter-selected role — simpler to demo).
- Whether to include the two-sided (candidate → startups) view (only if spine + wow are done).

## 19. Notes for the next Claude Code agent

- Read §0–§5 and §12 before writing any code; §9 tells you exactly what to lift from Squire.
- Build the **spine (§14 steps 1–3)** before anything clever. Deploy early for the live URL.
- Treat `/mockups` as the visual contract; the Allocation Board screen still needs designing.
- Keep the user's working style in mind: they want blunt, strategic input — flag scope creep, don't just comply.
- Everything tagged ⚪ is a mock or a roadmap slide; do not spend real build time there.
```
