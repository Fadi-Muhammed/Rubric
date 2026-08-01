import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, Star, Check, CalendarClock, FileText } from "lucide-react";
import type { RankedMatch, Startup } from "@/data/types";
import { getCycle } from "@/lib/data";
import { ScoreDial } from "@/components/score-dial";
import { AuthenticityBadge } from "@/components/authenticity-badge";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   CandidateDrawer — right-side detail panel for a single match.
   Opens from a Match Pool row via a shared-element (layoutId) ScoreDial
   morph. Shows the fit_reasons breakdown, skills, screening answers, an
   authenticity read, and a resume placeholder. The shortlist toggle here
   syncs with the row (both drive the same data-layer state). Closes on ESC
   and overlay click. Honors prefers-reduced-motion (simple fade).
--------------------------------------------------------------------------- */

type Props = {
  match: RankedMatch;
  startup: Startup;
  rank: number;
  total: number;
  onClose: () => void;
  onToggleShortlist: () => void;
};

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  } catch {
    return "—";
  }
}

export function CandidateDrawer({
  match,
  startup,
  rank,
  total,
  onClose,
  onToggleShortlist,
}: Props) {
  const reduce = useReducedMotion();
  const cycle = getCycle();
  const app = match.application;
  const shortlisted = match.shortlistStatus === "shortlisted";

  // Close on ESC + lock background scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const panelMotion = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
        transition: { type: "spring" as const, stiffness: 320, damping: 34 },
      };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* scrim */}
      <motion.div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* panel */}
      <motion.aside
        {...panelMotion}
        className="relative flex h-full w-full max-w-[560px] flex-col border-l border-hairline bg-elevated shadow-ambient"
        role="dialog"
        aria-modal="true"
        aria-label={`Candidate detail: ${app.name}`}
      >
        {/* header */}
        <div className="flex flex-none flex-col gap-5 border-b border-hairline p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-meta text-secondary">
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-eyebrow font-medium text-accent">
                Rank {String(rank).padStart(2, "0")}
              </span>
              {startup.name} · {startup.roleTitle}
            </div>
            <button
              onClick={onClose}
              className="grid h-7 w-7 place-items-center rounded-lg border border-hairline text-secondary transition-colors hover:border-accent hover:text-ink"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
          </div>

          <div className="flex items-center gap-5">
            <motion.div layoutId={reduce ? undefined : `dial-${match.id}`}>
              <ScoreDial value={match.fitScore} size={84} strokeWidth={6} />
            </motion.div>
            <div className="flex min-w-0 flex-col gap-2">
              <h2 className="font-display text-h3 font-normal leading-tight tracking-tight">
                {app.name}
              </h2>
              <p className="text-meta text-secondary">
                {app.major} · {app.year} · GPA {app.gpa.toFixed(1)}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <AuthenticityBadge pct={match.authenticityScore} showLabel />
                <span className="flex h-[26px] items-center gap-1.5 rounded-full border border-hairline px-2.5 text-eyebrow font-medium text-secondary">
                  <CalendarClock className="h-3 w-3" strokeWidth={1.8} />
                  Applied {fmtDate(app.createdAt)}
                </span>
                {match.isHiddenGem && (
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 text-eyebrow font-medium text-accent">
                    Hidden gem
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* actions */}
          <div className="flex gap-2.5">
            <button
              onClick={onToggleShortlist}
              className={cn(
                "flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-meta font-medium transition-colors",
                shortlisted
                  ? "bg-accent text-white hover:bg-accent-hover"
                  : "border border-hairline text-ink hover:border-accent hover:text-accent"
              )}
            >
              {shortlisted ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={2} /> Shortlisted for {startup.name.split(" ")[0]}
                </>
              ) : (
                <>
                  <Star className="h-4 w-4" strokeWidth={1.8} /> Shortlist for {startup.name.split(" ")[0]}
                </>
              )}
            </button>
            <button
              className="h-10 flex-none rounded-lg border border-hairline px-4 text-meta font-medium text-secondary"
              title="Mocked — no email is sent in the demo"
            >
              Request interview
            </button>
          </div>
        </div>

        {/* scrollable body */}
        <div className="flex flex-1 flex-col gap-8 overflow-y-auto p-6">
          {/* fit reasons */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-eyebrow font-medium uppercase tracking-[0.1em] text-secondary">
                Why they rank {rank === 1 ? "first" : `#${rank}`} for {startup.name}
              </span>
              <span className="text-eyebrow text-secondary">
                {match.fitReasons.length} signal{match.fitReasons.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {match.fitReasons.map((r, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-lg border border-hairline bg-surface p-3.5"
                >
                  <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-accent-soft font-mono text-eyebrow font-medium text-accent">
                    {i + 1}
                  </span>
                  <span className="text-meta leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
            {/* skills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {app.skills.map((s) => {
                const wanted = startup.skillsWanted.includes(s);
                return (
                  <span
                    key={s}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-eyebrow font-medium",
                      wanted ? "bg-accent-soft text-accent" : "bg-skeleton text-secondary"
                    )}
                  >
                    {s}
                  </span>
                );
              })}
            </div>
          </section>

          {/* screening answers */}
          <section className="flex flex-col gap-3">
            <span className="text-eyebrow font-medium uppercase tracking-[0.1em] text-secondary">
              Screening answers
            </span>
            <div className="flex flex-col gap-3">
              {cycle.screeningQuestions
                .slice()
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((q, i) => (
                  <div
                    key={q.id}
                    className="flex flex-col gap-2 rounded-lg border border-hairline bg-surface p-4"
                  >
                    <span className="flex items-baseline gap-2 text-meta font-medium text-secondary">
                      <span className="font-mono text-eyebrow">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {q.text}
                    </span>
                    <p className="text-meta leading-relaxed">
                      {app.answers[q.id]?.trim() || (
                        <span className="italic text-secondary">No answer provided.</span>
                      )}
                    </p>
                  </div>
                ))}
            </div>
          </section>

          {/* authenticity + resume */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_200px]">
            <div className="flex flex-col gap-3">
              <span className="text-eyebrow font-medium uppercase tracking-[0.1em] text-secondary">
                Authenticity read
              </span>
              <div className="flex flex-col gap-3 rounded-lg border border-hairline bg-surface p-4">
                <AuthenticityBadge pct={match.authenticityScore} showLabel />
                <p className="text-meta leading-relaxed text-secondary">
                  {app.aiAuthenticityRationale}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-eyebrow font-medium uppercase tracking-[0.1em] text-secondary">
                Resume
              </span>
              <div className="flex flex-col gap-2 rounded-lg border border-hairline bg-surface p-3.5">
                <div className="h-2 w-3/5 rounded-full bg-secondary" />
                <div className="h-1.5 w-2/5 rounded-full bg-skeleton" />
                <div className="my-1 h-px bg-hairline" />
                <div className="h-1.5 w-11/12 rounded-full bg-skeleton" />
                <div className="h-1.5 w-4/5 rounded-full bg-skeleton" />
                <div className="h-1.5 w-2/3 rounded-full bg-skeleton" />
                <div className="h-1.5 w-1/2 rounded-full bg-accent-soft" />
                <div className="my-1 h-px bg-hairline" />
                <div className="h-1.5 w-3/4 rounded-full bg-skeleton" />
                <div className="h-1.5 w-5/6 rounded-full bg-skeleton" />
                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-eyebrow text-secondary">
                    <FileText className="h-3 w-3" strokeWidth={1.8} />
                    {app.resumeFileName}
                  </span>
                  <button className="text-eyebrow font-medium text-accent" title="Mock — no file to open">
                    Open
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* footer */}
        <div className="flex flex-none items-center justify-between border-t border-hairline px-6 py-3.5 text-eyebrow text-secondary">
          <span>Esc to close · click outside to dismiss</span>
          <span className="font-mono">
            {rank} / {total}
          </span>
        </div>
      </motion.aside>
    </div>
  );
}
