import { useState } from "react";
import { Check } from "lucide-react";
import { ScoreDial } from "@/components/score-dial";
import { AuthenticityBadge } from "@/components/authenticity-badge";
import { cn } from "@/lib/utils";

/* ----------------------------- section shell ----------------------------- */
function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 border-t border-hairline pt-10">
      <span className="text-eyebrow font-medium uppercase tracking-[0.12em] text-secondary">
        {n} — {title}
      </span>
      {children}
    </section>
  );
}

const swatches = [
  { name: "Canvas", token: "--canvas", cls: "bg-canvas" },
  { name: "Surface", token: "--surface", cls: "bg-surface" },
  { name: "Ink", token: "--ink", cls: "bg-ink" },
  { name: "Secondary", token: "--secondary", cls: "bg-secondary" },
  { name: "Accent", token: "--accent", cls: "bg-accent" },
  { name: "Accent soft", token: "--accent-soft", cls: "bg-accent-soft" },
];

const typeScale = [
  { size: "56 / Fr", cls: "font-display text-h1", sample: "Shortlist" },
  { size: "40 / Fr", cls: "font-display text-h2", sample: "Match pool" },
  { size: "28 / Fr", cls: "font-display text-h3", sample: "Ranked candidates" },
  { size: "20 / GS", cls: "text-h4 font-medium", sample: "Section heading, medium" },
  { size: "16 / GS", cls: "text-body", sample: "Body copy sits at 16/24 regular." },
  { size: "14 / GS", cls: "text-meta text-secondary", sample: "Secondary / meta text" },
];

export default function StyleGuide() {
  const [toggle, setToggle] = useState(true);
  const [checked, setChecked] = useState(true);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-2 px-8 py-14">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-hairline pb-6">
        <div className="flex flex-col gap-1">
          <span className="text-eyebrow font-medium uppercase tracking-[0.14em] text-secondary">
            Rubric — Design System
          </span>
          <h1 className="font-display text-h2 font-normal">The living rubric</h1>
        </div>
        <span className="text-right font-mono text-xs text-secondary">
          v1.0 · 4/8pt grid
        </span>
      </div>

      <div className="flex flex-col gap-10 pt-4">
        {/* 01 — Color */}
        <Section n="01" title="Color tokens">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {swatches.map((s) => (
              <div key={s.name} className="flex flex-col gap-2">
                <div className={cn("h-16 rounded-md border border-hairline", s.cls)} />
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{s.name}</span>
                  <span className="font-mono text-[11px] text-secondary">{s.token}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 02 — Type */}
        <Section n="02" title="Type scale">
          <div className="flex flex-col gap-4">
            {typeScale.map((t) => (
              <div key={t.size} className="flex items-baseline gap-5">
                <span className="w-16 shrink-0 font-mono text-[11px] text-secondary">
                  {t.size}
                </span>
                <span className={t.cls}>{t.sample}</span>
              </div>
            ))}
          </div>
          <p className="border-t border-hairline pt-4 text-meta text-secondary">
            Fraunces is display only — headlines, big numbers, dial values. General
            Sans (fallback Satoshi) carries every piece of UI chrome.
          </p>
        </Section>

        {/* 03 — Buttons */}
        <Section n="03" title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <button className="h-10 rounded-md bg-accent px-[18px] text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.98]">
              Publish role
            </button>
            <button className="h-10 rounded-md border border-hairline bg-surface px-[18px] text-sm font-medium text-ink transition-colors hover:bg-row-hover active:scale-[0.98]">
              Secondary
            </button>
            <button className="h-10 rounded-md px-[18px] text-sm font-medium text-ink transition-colors hover:bg-row-hover active:scale-[0.98]">
              Ghost
            </button>
            <button className="h-10 cursor-not-allowed rounded-md bg-accent-soft px-[18px] text-sm font-medium text-accent opacity-70">
              Disabled
            </button>
            <button className="h-8 rounded-full bg-accent px-3.5 text-[13px] font-medium text-white">
              Pill · active
            </button>
            <button className="h-8 rounded-full border border-hairline bg-surface px-3.5 text-[13px] font-medium text-secondary transition-colors hover:text-ink">
              Pill
            </button>
          </div>
        </Section>

        {/* 04 — Inputs */}
        <Section n="04" title="Inputs & controls">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-secondary">Default</span>
              <input
                defaultValue="Machine Learning Intern"
                className="h-10 rounded-md border border-hairline bg-surface px-3 text-sm outline-none transition-shadow placeholder:text-secondary focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-secondary">Error</span>
              <input
                className="h-10 rounded-md border border-auth-red bg-surface px-3 text-sm outline-none"
                placeholder="—"
              />
              <span className="text-xs text-auth-red">A public title is required</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-8 pt-2">
            {/* Toggle */}
            <button
              onClick={() => setToggle((v) => !v)}
              className="flex items-center gap-2.5"
              aria-pressed={toggle}
            >
              <span
                className={cn(
                  "relative h-6 w-10 rounded-full border transition-colors",
                  toggle ? "border-accent bg-accent" : "border-hairline bg-skeleton"
                )}
              >
                <span
                  className={cn(
                    "absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-all",
                    toggle ? "left-[19px]" : "left-[3px]"
                  )}
                />
              </span>
              <span className="text-sm">{toggle ? "On" : "Off"}</span>
            </button>

            {/* Checkbox */}
            <button
              onClick={() => setChecked((v) => !v)}
              className="flex items-center gap-2.5"
              aria-pressed={checked}
            >
              <span
                className={cn(
                  "grid h-[18px] w-[18px] place-items-center rounded-[6px] border transition-colors",
                  checked ? "border-accent bg-accent" : "border-hairline bg-surface"
                )}
              >
                {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </span>
              <span className="text-sm">Checkbox</span>
            </button>
          </div>
        </Section>

        {/* 05 — Score dial */}
        <Section n="05" title="Score dial">
          <div className="flex flex-wrap items-end gap-7">
            <ScoreDial value={89} size={88} strokeWidth={6} />
            <ScoreDial value={70} size={56} strokeWidth={4} delay={0.1} />
            <ScoreDial value={50} size={40} strokeWidth={3} delay={0.2} />
            <ScoreDial value={null} size={40} strokeWidth={3} />
          </div>
          <p className="text-meta text-secondary">
            Track = hairline. Arc = accent, round cap, starts at 12 o'clock, sweeps
            clockwise and counts up. Empty state keeps the track and shows an em-dash.
          </p>
        </Section>

        {/* 06 — Authenticity */}
        <Section n="06" title="Authenticity badge scale (% AI-written)">
          <div className="flex flex-wrap gap-3">
            <AuthenticityBadge pct={4} showLabel />
            <AuthenticityBadge pct={46} showLabel />
            <AuthenticityBadge pct={88} showLabel />
          </div>
          <div className="h-2.5 rounded-full bg-[linear-gradient(90deg,var(--auth-green),var(--auth-amber),var(--auth-red))]" />
          <div className="flex justify-between text-xs text-secondary">
            <span>0% · human</span>
            <span>50% · mixed</span>
            <span>100% · AI</span>
          </div>
        </Section>

        {/* 07 — Candidate row */}
        <Section n="07" title="Ranked candidate rows">
          <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
            <div className="grid grid-cols-[56px_1fr_120px_110px] items-center gap-4 border-b border-hairline px-5 py-3.5 text-eyebrow font-medium uppercase tracking-[0.1em] text-secondary">
              <span>Fit</span>
              <span>Candidate</span>
              <span>Authenticity</span>
              <span>State</span>
            </div>
            {[
              { name: "Layla Al-Mansouri", fit: 91, auth: 4, state: "Default" },
              { name: "Omar Haddad", fit: 83, auth: 46, state: "Hidden gem" },
              { name: "Yousef Karim", fit: 76, auth: 88, state: "Flagged" },
            ].map((c, i) => (
              <div
                key={c.name}
                className={cn(
                  "grid grid-cols-[56px_1fr_120px_110px] items-center gap-4 px-5 py-3.5",
                  i < 2 && "border-b border-hairline"
                )}
              >
                <ScoreDial value={c.fit} size={36} strokeWidth={3} delay={i * 0.05} />
                <span className="text-sm font-medium">{c.name}</span>
                <AuthenticityBadge pct={c.auth} />
                <span className="text-[13px] text-secondary">{c.state}</span>
              </div>
            ))}
          </div>
        </Section>

        <p className="border-t border-hairline pt-6 font-mono text-xs text-secondary">
          Step 1 · app shell + design system verified. Data layer comes next (Step 2).
        </p>
      </div>
    </div>
  );
}
