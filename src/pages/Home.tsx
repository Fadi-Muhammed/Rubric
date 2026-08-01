import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

const swatches: { name: string; token: string; className: string; note: string }[] = [
  { name: "Canvas", token: "--canvas", className: "bg-canvas", note: "warm off-white" },
  { name: "Surface", token: "--surface", className: "bg-surface", note: "cards / panels" },
  { name: "Ink", token: "--ink", className: "bg-ink", note: "near-black warm" },
  { name: "Accent", token: "--accent", className: "bg-accent", note: "actions only" },
];

const authScale: { name: string; className: string }[] = [
  { name: "Human", className: "bg-auth-green" },
  { name: "Mixed", className: "bg-auth-amber" },
  { name: "AI", className: "bg-auth-red" },
];

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 + i * 0.035, type: "spring", stiffness: 300, damping: 30 },
  }),
};

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex max-w-3xl flex-col gap-14 px-6 py-16 md:py-24">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-eyebrow font-medium uppercase tracking-[0.14em] text-secondary">
              Rubric — Design System
            </span>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="font-display text-h1 font-normal"
            >
              Rubric
            </motion.h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Tagline */}
        <motion.p
          custom={0}
          variants={fade}
          initial="hidden"
          animate="show"
          className="max-w-[62ch] font-display text-h3 font-normal text-ink"
        >
          One shared pool of applicants, ranked into a conflict-free shortlist for
          every host startup.
        </motion.p>

        {/* Color tokens */}
        <section className="flex flex-col gap-4">
          <span className="text-eyebrow font-medium uppercase tracking-[0.12em] text-secondary">
            01 — Color tokens
          </span>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {swatches.map((s, i) => (
              <motion.div
                key={s.name}
                custom={i}
                variants={fade}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-2"
              >
                <div
                  className={`h-20 rounded-md border border-hairline ${s.className}`}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{s.name}</span>
                  <span className="font-mono text-xs text-secondary">{s.token}</span>
                  <span className="text-xs text-secondary">{s.note}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Authenticity scale */}
          <div className="mt-2 flex flex-col gap-2">
            <span className="font-mono text-xs text-secondary">
              AI-authenticity scale (green → amber → red)
            </span>
            <div className="flex overflow-hidden rounded-full border border-hairline">
              {authScale.map((a) => (
                <div
                  key={a.name}
                  className={`flex h-8 flex-1 items-center justify-center text-xs font-medium text-white ${a.className}`}
                >
                  {a.name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="flex flex-col gap-4">
          <span className="text-eyebrow font-medium uppercase tracking-[0.12em] text-secondary">
            02 — Type
          </span>
          <div className="flex flex-col gap-5 rounded-xl border border-hairline bg-surface p-6 shadow-ambient">
            <div className="flex items-baseline gap-4">
              <span className="w-16 shrink-0 font-mono text-xs text-secondary">
                Fraunces
              </span>
              <span className="font-display text-h2 font-normal">
                The living rubric
              </span>
            </div>
            <div className="flex items-baseline gap-4 border-t border-hairline pt-5">
              <span className="w-16 shrink-0 font-mono text-xs text-secondary">
                Gen. Sans
              </span>
              <p className="max-w-[60ch] text-body text-secondary">
                Fraunces is display only — headlines, big numbers, score dials.
                General Sans (fallback Satoshi) carries every piece of UI chrome:
                buttons, labels, tables, and body copy like this paragraph.
              </p>
            </div>
          </div>
        </section>

        <p className="border-t border-hairline pt-6 font-mono text-xs text-secondary">
          Step 0 · scaffold verified — fonts, tokens & theme are live. Screens come next.
        </p>
      </div>
    </main>
  );
}
