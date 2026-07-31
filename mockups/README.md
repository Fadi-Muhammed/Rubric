# Rubric — Design Mockups (reference only)

High-fidelity mockups generated with Claude Design. **These are a visual/UX reference, not build code.**
When we build Rubric for real (React + TypeScript + Tailwind + shadcn/ui, reusing Squire's components),
we rebuild these screens as proper components — we do not ship this markup.

Open any `.dc.html` in a browser; `support.js` must sit alongside them (it does).

## Files

| File | Screen |
|---|---|
| `Rubric Mockups.dc.html` | Master file — all screens together |
| `StyleTile.dc.html` | Design system: color tokens (light/dark), type scale, components, score dial, authenticity badges |
| `Dashboard.dc.html` | Recruiter dashboard — open roles + live stats |
| `IntakeBuilder.dc.html` | 3-step job/intake builder (details → form builder → publish + link) |
| `MatchPool.dc.html` | HERO — "Match pool → startup": ranked list, score dials, fit reasons |
| `CandidateDrawer.dc.html` | Candidate detail (shared-element drawer from a row) |
| `ApplyPage.dc.html` | Public candidate application form |
| `CommandPalette.dc.html` | ⌘K command palette overlay |

## Locked design system (source of truth)

- **Brand concept:** "the living rubric" — ranked rows + a signature radial score dial.
- **Palette (light):** canvas `#FAFAF7`, ink `#16161A`, accent `#2743E0`, hairline borders (no heavy shadows).
- **Palette (dark):** canvas `#0E0E11`, ink `#F4F4F2`, accent `#6B82FF`.
- **AI-authenticity score:** diverging green → amber → red (kept in a different hue from the accent).
- **Type:** Fraunces (serif) for display/big numbers only; General Sans / Satoshi for all UI.
- **Radius:** 10–12px standard / 14px large surfaces, held consistent. Lucide icons, no emoji.
- **Motion (for the build):** framer-motion springs, shared-element row→drawer, ~35ms staggered list
  entrance, count-up scores, layout-animated filter reflow, skeletons not spinners, honor prefers-reduced-motion.
