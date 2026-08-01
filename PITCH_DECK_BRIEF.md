# Rubric — Pitch Deck Design Brief

**For:** Claude Design
**Deliverable:** 8-slide pitch deck, 16:9 (1920 × 1080 px)
**Product:** Rubric — QSTP "BUILD FOR QSTP" Hackathon, Challenge 2 (CV Matching Bottleneck)

---

## 0. READ THIS FIRST — do not guess, ask

This deck must follow a **fixed 8-slide structure** (mandated by the official hackathon template) and use
**Rubric's real design system** (specified in §2, exact values — do not substitute).

**Several facts in this brief are marked `[ASK]`. Do NOT invent, estimate, or use placeholder-sounding
filler for anything marked `[ASK]`.** Stop and ask the user for every one of them before you begin
designing. Batch all your questions into one message so the user answers them in a single pass.

Specifically, **never fabricate a statistic.** This is a judged pitch — an invented metric that a judge
probes in Q&A will sink the submission. If the user cannot supply a real number, ask them which of the
*defensible framings* in §4 (Slide 7) they want to use instead.

Everything **not** marked `[ASK]` is verified fact from the product's codebase and spec — use it as written.

---

## 1. Product context (verified — use as written)

**Rubric** is a recruiting product for the QSTP Internship Program. It turns **one shared pool of intern
applicants** into a **ranked, conflict-free shortlist for each of many host startups**, using AI matching.

It is **not** a single-company ATS. That distinction is the entire pitch:

- **Deema** (the AI resume-ranking tool QSTP uses today) ranks resumes against **one job description at a time**.
- **Greenhouse** is a **single-company** ATS.
- **Neither handles one shared pool matched across dozens of startups with different needs, at once.**
  ← This gap is the moat. The deck should make a judge feel this.

**The pain being solved:** each cycle, 150+ candidates are reviewed manually (weeks of work). Filtering is
subjective, so qualified candidates get missed and host startups receive poor-fit shortlists.

**What was actually built** (a working prototype, not a mockup):

| Feature | What it does |
|---|---|
| **Match Pool** | For one host startup, ranks the entire shared candidate pool — fit score, "why they fit" reasons, AI-authenticity score |
| **Allocation Board** | One-click allocation of the whole pool across every startup at once, respecting capacity, with no candidate double-booked. Drag to override. |
| **Hidden Gems** | Surfaces strong candidates a naive GPA/keyword filter would reject |
| **Intake Builder** | 3-step role builder with real AI assist ("Improve with AI", "Suggest screening questions") |
| **Invite shortlisted** | Sends interview invitations to shortlisted candidates |

**Headline features for the pitch are Allocation Board and Hidden Gems** — lead with those.

---

## 2. Brand & design system (exact — do not substitute)

Rubric's design language is called **"the living rubric."** It is editorial, calm, and restrained — warm
off-white paper, near-black ink, one confident accent, and a lot of air. It is **not** a typical SaaS deck:
no gradients, no glows, no drop shadows stacked on cards, no stock photography, no emoji, no icon soup.

### 2.1 Colour tokens

Use the **light** palette as the deck's primary. (A dark variant exists — see §2.2 — only use it if the
user picks dark in `[ASK-9]`.)

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#FAFAF7` | Slide background. Warm off-white — **never pure white** |
| `surface` | `#FFFFFF` | Cards / panels sitting on canvas |
| `ink` | `#16161A` | Headlines and body text. Warm near-black — **never pure black** |
| `secondary` | `#6B6B72` | Sub-text, captions, labels |
| `hairline` | `rgba(0,0,0,0.08)` | 1px dividers and card borders |
| `accent` | `#2743E0` | Deep cobalt. **Actions and emphasis ONLY** |
| `accent-soft` | `rgba(39,67,224,0.10)` | Tinted chip/highlight fills |
| `skeleton` | `#F0F0EA` | Neutral placeholder blocks |

**AI-authenticity scale** (a deliberately different hue family from the accent — only use where you are
representing the human↔AI authenticity signal):

| Token | Hex | Meaning |
|---|---|---|
| `auth-green` | `#16A34A` | Human-written |
| `auth-amber` | `#F59E0B` | Mixed |
| `auth-red` | `#EF4444` | AI-written |

**Accent discipline — important:** cobalt is for *actions and single points of emphasis*. Target **one
accent moment per slide**. If a slide has three accent-coloured things competing, it is wrong.

### 2.2 Dark variant (only if requested)

`canvas #0E0E11` · `surface #17171B` · `ink #F4F4F2` · `secondary #A0A0A8` · `accent #6B82FF` ·
`hairline rgba(255,255,255,0.09)`

### 2.3 Typography

Two families, strictly separated:

- **Fraunces** (serif) — **display only**: slide headlines and big numbers. Nothing else. Ever.
  Fallback if unavailable: Georgia.
- **General Sans** (sans) — **all** body, labels, captions, UI text.
  Fallback if unavailable: Satoshi, then Inter, then system-ui.

**Locked type scale** — do not introduce intermediate sizes. Scaled for 1920×1080 (source app sizes ×2):

| Role | Size | Family | Notes |
|---|---|---|---|
| Slide headline | 112 px | Fraunces | `letter-spacing: -0.03em`, `line-height: 1` |
| Big stat number | 112–160 px | Fraunces | Impact slide only |
| Section heading | 80 px | Fraunces | `-0.02em` |
| Sub-heading | 56 px | Fraunces | `-0.02em` |
| Feature title | 40 px | General Sans | Medium weight |
| Body | 32 px | General Sans | `line-height: 1.5` |
| Caption / meta | 28 px | General Sans | colour `secondary` |
| Eyebrow / label | 24 px | General Sans | UPPERCASE, `letter-spacing: 0.1em`, colour `secondary` |

Body text is **never** Fraunces. Headlines are **never** General Sans.

### 2.4 Shape, depth, motion

- **Corner radius:** 20px standard cards, 28px large surfaces, fully-round for pills and the score dial.
  (App uses 10/12/14px; doubled for deck scale.)
- **Shadow:** exactly **one** soft ambient shadow, used sparingly:
  `0 2px 4px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.06)`. Never stack shadows. Prefer a hairline
  border over a shadow when separating a card from the canvas.
- **Borders:** 1–2px hairline. Crisp, not heavy.
- **Signature UI element:** the **score dial** — a circular progress ring showing a 0–100 fit score, with
  the number set in Fraunces at its centre. If you need one visual motif to carry the brand, use this.

---

## 3. Layout & anti-crowding rules (hard constraints)

The single most common failure mode here is a crowded slide. These are **limits, not targets** — coming in
under them is good.

1. **One idea per slide.** If a slide is making two arguments, it needs to become two slides or lose one.
2. **Margins:** minimum **120 px** on all four edges of the 1920×1080 canvas. Nothing bleeds into it except
   a deliberate full-bleed screenshot.
3. **Whitespace floor:** at least **35%** of every slide is empty space. Resist filling it.
4. **Word budget per slide: 55 words maximum**, including the headline. Slides 4–6 (screenshots): **20 words max.**
5. **Headlines:** 8 words maximum.
6. **Bullets:** maximum **3 per slide**, maximum **18 words each**. No sub-bullets. No nested lists, ever.
7. **No paragraphs.** If a sentence wraps past two lines, cut it.
8. **One accent moment per slide.**
9. **Alignment:** pick one strong left-aligned grid and hold it across all 8 slides. Centred text only on
   the title slide and the big stat numbers.
10. **Consistency:** the eyebrow label, slide number, and headline must sit in the *exact same position*
    on every slide. A judge should never see the layout jump between slides.
11. **No decorative filler:** no stock photos, no clip-art icons, no gradient blobs, no emoji, no
    3D illustrations, no drop-shadowed "floating" mockups.

**Slide-number motif:** the template numbers its sections `01`–`05`. Render these in Fraunces, in
`secondary` or `accent-soft`, as a quiet corner element — not a loud graphic.

---

## 4. Slide-by-slide specification

The 8-slide structure below is **fixed by the official template** — do not add, remove, or reorder slides.

---

### Slide 1 — Title

| Element | Content |
|---|---|
| Product name | **Rubric** — set large in Fraunces. This is the hero. |
| Team name | **Pantheon** |
| Challenge | "Challenge 2 — CV Matching Bottleneck" |
| One-liner | Use: **"One shared pool of applicants. A ranked, conflict-free shortlist for every host startup."** (Confirm with user, or ask for their preferred wording.) |

**Design:** maximum restraint. Warm canvas, the wordmark, one line of positioning. This slide should feel
confident and empty. No background graphic. Optionally, a single faint score-dial motif in a corner.

---

### Slide 2 — Problem `01`

Headline suggestion: **"Weeks of manual review. Wrong matches anyway."**

Three problems, one line of description each (template calls for exactly 3):

1. **Manual at scale** — 150+ candidates reviewed by hand each cycle. It takes weeks.
2. **Subjective filtering** — good candidates get cut by crude GPA and keyword screens.
3. **Poor-fit shortlists** — host startups receive candidates who don't match what they actually need.

**Design:** three columns or three stacked rows, hairline-separated. Number them in Fraunces. Keep the
descriptions to one line each. Lead the eye with the sharpest fact — **150+ candidates, reviewed manually,
every cycle.** Consider setting "150+" as a large Fraunces number as the slide's single accent moment.

> The judges wrote this brief. Do not re-explain their problem to them — prove we understand it, fast.

---

### Slide 3 — Our Solution `02`

Headline suggestion: **"One pool, ranked for every startup at once."**

Three features, one line each — plain language a non-technical judge pictures immediately:

1. **Allocation Board** — assigns the whole pool across every startup in one click. No double-booking.
2. **Hidden Gems** — surfaces strong candidates a GPA filter would have thrown away.
3. **Match Pool** — ranks every candidate for each specific role, with the reasons why.

**Design:** three equal cards on `surface` with hairline borders, or three hairline-separated columns.
High-level only — slides 4–6 go deeper. Keep each description to a single line.

---

### Slides 4, 5, 6 — How It Works `03`

One screenshot per slide, one feature per slide, **20 words maximum per slide.** No paragraphs.

| Slide | Feature | Screenshot |
|---|---|---|
| 4 | Allocation Board | `[ASK-5]` |
| 5 | Hidden Gems | `[ASK-5]` |
| 6 | Match Pool | `[ASK-5]` |

Each slide gets: the eyebrow `HOW IT WORKS` + `03`, a short feature title, **one** sentence (≤18 words)
saying what the judge is looking at, and the screenshot.

**Design:** let the screenshot be the hero — give it 60–70% of the slide. Present it cleanly: hairline
border, 20px radius, the single ambient shadow, on the warm canvas. **No laptop/browser mockup frames, no
perspective tilt, no floating device shells.** If a detail matters, use one thin accent callout line — at
most one per slide.

---

### Slide 7 — Impact `04`

The template asks for **2–3 measurable outcomes** — what *changes* because of Rubric, not what it does.
Each follows the shape: `[what you're measuring] → [specific number or target]`, versus today's baseline.

**RESOLVED — use exactly these three. Full derivations in `IMPACT_METRICS.md`; do not alter the numbers.**

> **83%** — of CV reviews in a per-role process are duplicate reads.
> 900 reads become 150. *Weeks of screening → under one day.*
>
> **1 in 3** — roles has a top-ranked candidate a GPA 3.0 filter would auto-reject.
> 2 of 6 roles in our cohort. *Baseline: those candidates are never seen.*
>
> **17%** — of the pool is wanted by two or more startups at once.
> Flagged before offers go out. *Baseline: invisible until it's a conflict.*

Required footnote, small, bottom of slide — **do not omit**:
*Measured on a 30-candidate synthetic cohort across 6 host startups; reproducible via `scripts/impact-analysis.mjs`.*

**Design:** 2–3 huge Fraunces numbers with a short label beneath each. This is the one slide where a big
number carries the whole layout. Enormous type, enormous whitespace, one accent colour. Include the
baseline as small `secondary` text so the contrast is legible ("vs. weeks today").

---

### Slide 8 — Team `05`

**Three members — not four.** Fadi Muhammed, Nihal Ashik, Amanda Haddad. Rebalance the layout for three
columns; do **not** leave an empty fourth card, it reads as a missing teammate.

**Not bios** — one line each on the *specific* skill or experience that makes them useful for this
challenge. Judges are quietly asking "can this team actually pull this off." Answer that.

`[ASK-3]` — one line per person.

**Design:** three columns, hairline-separated. Name in General Sans Medium, the one-line credential in
`secondary`. If the user provides photos, crop to identical circles; if not, **omit images entirely** —
do not substitute avatar placeholders or initials-in-a-circle unless the user asks.

---

## 5. Questions to ask the user before designing

Ask all of these in one message. Do not begin designing until they're answered.

| # | Question |
|---|---|
| ~~`ASK-1`~~ | ~~Team name~~ — **ANSWERED: Pantheon.** Filename `Pantheon_Deck.pdf`. |
| ~~`ASK-2`~~ | ~~Member names~~ — **ANSWERED: Fadi Muhammed, Nihal Ashik, Amanda Haddad (three, not four).** |
| `ASK-3` | For each member, the **one line** on the specific skill/experience that makes them useful here? |
| `ASK-4` | Confirm the one-line product description for the title slide, or give your preferred wording. |
| `ASK-5` | Please provide **3 screenshots** — Allocation Board, Hidden Gems, Match Pool. Light or dark theme? Should they be full-screen captures or cropped to the key region? |
| ~~`ASK-6`~~ | ~~Impact metrics~~ — **ANSWERED: the three stats are fixed in Slide 7 above. Derivations in `IMPACT_METRICS.md`. Do not restate, round, or embellish them.** |
| `ASK-7` | Should the deck **disclose Squire as pre-existing IP**? (The build spec says to disclose it in the PRD and pitch — confirm whether it belongs on a slide, and if so which one.) |
| `ASK-8` | Do you want the **live demo URL** on the deck (likely the title or final slide)? If so, what is it? |
| `ASK-9` | **Light or dark** theme for the deck? (Light is the recommended default — it matches the product's primary "warm paper" identity.) |
| `ASK-10` | Output format: editable source, PDF, or both? Any file-size limit from the submission rules? |

---

## 6. Definition of done

- [ ] Exactly 8 slides, in the template's fixed order, 16:9 at 1920×1080.
- [ ] Every `[ASK]` resolved by the user — **nothing invented**, no placeholder text left in the file.
- [ ] Colours, fonts, and type scale match §2 exactly.
- [ ] Every slide passes §3: ≤55 words (≤20 on screenshot slides), ≤8-word headline, ≤3 bullets,
      ≥35% whitespace, ≥120px margins, one accent moment.
- [ ] Eyebrow, slide number, and headline sit in identical positions on all 8 slides.
- [ ] Fraunces used **only** for headlines and big numbers; General Sans for everything else.
- [ ] No stock imagery, gradients, emoji, device mockup frames, or stacked shadows.
- [ ] Zero fabricated statistics.
