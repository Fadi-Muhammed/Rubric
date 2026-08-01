import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Gem, ArrowUpRight } from "lucide-react";
import { listHiddenGems, getStartup } from "@/lib/data";
import type { RankedMatch } from "@/data/types";
import { ScoreDial } from "@/components/score-dial";
import { AuthenticityBadge } from "@/components/authenticity-badge";

/* ---------------------------------------------------------------------------
   Hidden Gems — the cross-pool view of Rubric's core argument: strong fits a
   naive GPA filter would silently reject. Each candidate is de-duped to their
   best gem match; the roles that surface them are listed underneath. This is
   the "we don't lose people at the CV stage" screen.
--------------------------------------------------------------------------- */

const STAGGER = 0.05;

type GemGroup = {
  best: RankedMatch;
  startupIds: string[];
};

export default function HiddenGems() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const groups = useMemo<GemGroup[]>(() => {
    const byApp = new Map<string, GemGroup>();
    for (const m of listHiddenGems()) {
      const g = byApp.get(m.applicationId);
      if (!g) {
        byApp.set(m.applicationId, { best: m, startupIds: [m.startupId] });
      } else {
        g.startupIds.push(m.startupId);
        if (m.fitScore > g.best.fitScore) g.best = m;
      }
    }
    return [...byApp.values()].sort((a, b) => b.best.fitScore - a.best.fitScore);
  }, []);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-7 px-8 py-10">
      <header className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-eyebrow font-medium uppercase tracking-[0.12em] text-accent">
          <Gem className="h-3.5 w-3.5" strokeWidth={1.8} /> Hidden Gems
        </span>
        <h1 className="font-display text-h1 font-normal leading-none tracking-tight">
          The people a filter would miss
        </h1>
        <p className="max-w-[64ch] text-body text-secondary">
          {groups.length} {groups.length === 1 ? "candidate" : "candidates"} across the pool are a
          strong fit for a role yet sit below the GPA line a traditional screen would cut at. Rubric
          surfaces them instead of dropping them.
        </p>
      </header>

      {groups.length === 0 ? (
        <div className="py-16 text-center text-body text-secondary">
          No hidden gems in the current pool.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {groups.map(({ best, startupIds }, i) => {
            const app = best.application;
            const startup = getStartup(best.startupId);
            const others = startupIds.length - 1;
            return (
              <motion.button
                key={app.id}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduce ? 0 : i * STAGGER, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => navigate(`/match/${best.startupId}`)}
                className="group flex flex-col gap-4 rounded-2xl border border-hairline bg-elevated p-5 text-left transition-colors hover:border-accent"
              >
                <div className="flex items-start gap-4">
                  <ScoreDial value={best.fitScore} size={48} strokeWidth={3.5} delay={i * STAGGER} />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-body font-medium">{app.name}</span>
                      <span className="flex flex-none items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-eyebrow font-medium text-accent">
                        <Gem className="h-3 w-3" strokeWidth={1.8} /> Gem
                      </span>
                    </div>
                    <span className="truncate text-meta text-secondary">
                      {app.major} · {app.year} · GPA {app.gpa.toFixed(1)}
                    </span>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 flex-none text-secondary transition-colors group-hover:text-accent"
                    strokeWidth={1.8}
                  />
                </div>

                <p className="line-clamp-2 text-meta leading-relaxed text-secondary">{app.blurb}</p>

                <div className="flex items-center justify-between gap-3 border-t border-hairline pt-3">
                  <span className="truncate text-eyebrow text-secondary">
                    Gem for{" "}
                    <span className="font-medium text-ink">{startup?.name ?? "a role"}</span>
                    {others > 0 && ` +${others} more`}
                  </span>
                  <AuthenticityBadge pct={best.authenticityScore} />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
