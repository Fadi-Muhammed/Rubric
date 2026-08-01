import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Gem, Sparkles } from "lucide-react";
import { listStartups, getMatchesForStartup } from "@/lib/data";
import { ScoreDial } from "@/components/score-dial";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Match Pool index — the chooser. A Match Pool is per-startup, so this screen
   lists every host role and lets the recruiter pick whose pool to rank. Each
   card leads with the numbers that matter for ranking: pool size, hidden gems
   surfaced, and the current best fit. Clicking opens /match/:startupId.
--------------------------------------------------------------------------- */

const STAGGER = 0.04;

type PoolCard = {
  id: string;
  host: string;
  role: string;
  applicants: number;
  gems: number;
  topFit: number | null;
  skills: string[];
};

function usePools(): PoolCard[] {
  return useMemo(
    () =>
      listStartups().map((s) => {
        const ranked = getMatchesForStartup(s.id);
        return {
          id: s.id,
          host: s.name,
          role: s.roleTitle,
          applicants: ranked.length,
          gems: ranked.filter((m) => m.isHiddenGem).length,
          topFit: ranked[0]?.fitScore ?? null,
          skills: s.skillsWanted.slice(0, 3),
        };
      }),
    []
  );
}

export default function MatchPoolIndex() {
  const pools = usePools();
  const reduce = useReducedMotion();

  const totalApplicants = pools[0]?.applicants ?? 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-8 py-12">
      {/* header */}
      <header className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-eyebrow font-medium uppercase tracking-[0.12em] text-secondary">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} /> Match pools
        </span>
        <h1 className="font-display text-h1 font-normal leading-none tracking-tight">
          Pick a pool to rank
        </h1>
        <p className="max-w-[60ch] text-body text-secondary">
          One shared pool of {totalApplicants} candidates, ranked separately for each host role.
          Choose a startup to open its Match Pool.
        </p>
      </header>

      {/* pool grid */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pools.map((p, i) => (
          <motion.div
            key={p.id}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * STAGGER, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to={`/match/${p.id}`}
              className="group flex h-full flex-col gap-5 rounded-xl border border-hairline bg-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-ambient"
            >
              {/* title */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-body font-medium leading-tight">{p.role}</span>
                  <span className="text-meta text-secondary">{p.host}</span>
                </div>
                <ScoreDial value={p.topFit} size={44} strokeWidth={3.5} delay={i * STAGGER} />
              </div>

              {/* skills */}
              <div className="flex flex-wrap gap-1.5">
                {p.skills.map((sk) => (
                  <span
                    key={sk}
                    className="rounded-full bg-elevated px-2.5 py-1 text-eyebrow font-medium text-secondary"
                  >
                    {sk}
                  </span>
                ))}
              </div>

              {/* stats */}
              <div className="mt-auto flex items-end justify-between gap-4">
                <div className="flex gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="font-display text-h3 tracking-tight">{p.applicants}</span>
                    <span className="text-eyebrow text-secondary">Ranked</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span
                      className={cn(
                        "flex items-center gap-1 font-display text-h3 tracking-tight",
                        p.gems > 0 && "text-accent"
                      )}
                    >
                      {p.gems > 0 && <Gem className="h-3.5 w-3.5" strokeWidth={1.8} />}
                      {p.gems}
                    </span>
                    <span className="text-eyebrow text-secondary">Hidden gems</span>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-eyebrow font-medium text-secondary opacity-0 transition-opacity duration-200 group-hover:text-accent group-hover:opacity-100">
                  Open
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
