import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, animate } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import {
  getCycle,
  getCycleStats,
  listStartups,
  getMatchesForStartup,
} from "@/lib/data";
import { ScoreDial } from "@/components/score-dial";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Recruiter Dashboard — the cycle's open host-startup roles + live pool stats.
   Reads entirely from the mock-first data layer (src/lib/data.ts).
--------------------------------------------------------------------------- */

/** Count-up number in Fraunces. Honors prefers-reduced-motion. */
function CountUp({
  value,
  delay = 0,
  className,
}: {
  value: number;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  const from = useRef(0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(from.current, value, {
      delay,
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    from.current = value;
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay, reduce]);

  return <span className={cn("font-display tracking-tight", className)}>{display}</span>;
}

type RoleCard = {
  id: string;
  title: string;
  host: string;
  need: string;
  employment: string;
  capacity: number;
  applicants: number;
  shortlisted: number;
  topFit: number | null;
  topName: string | null;
};

function useDashboardData() {
  return useMemo(() => {
    const cycle = getCycle();
    const stats = getCycleStats();
    const startups = listStartups();

    const roles: RoleCard[] = startups.map((s) => {
      const ranked = getMatchesForStartup(s.id);
      const top = ranked[0];
      return {
        id: s.id,
        title: s.roleTitle,
        host: s.name,
        need: s.needsDescription,
        employment: s.employmentType === "full_time" ? "Full-time" : "Part-time",
        capacity: s.capacity,
        applicants: ranked.length,
        shortlisted: ranked.filter((m) => m.shortlistStatus === "shortlisted").length,
        topFit: top ? top.fitScore : null,
        topName: top ? top.application.name : null,
      };
    });

    return { cycle, stats, roles };
  }, []);
}

/* ------------------------------- stats row ------------------------------- */

const STAT_STAGGER = 0.06;

function StatsRow({
  items,
}: {
  items: { label: string; value: number; accent?: boolean }[];
}) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * STAT_STAGGER, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-1.5 rounded-lg border border-hairline bg-surface p-5"
        >
          <CountUp
            value={s.value}
            delay={i * STAT_STAGGER}
            className={cn("text-h2", s.accent && "text-accent")}
          />
          <span className="text-meta text-secondary">{s.label}</span>
        </motion.div>
      ))}
    </section>
  );
}

/* ------------------------------- role card ------------------------------- */

const CARD_STAGGER = 0.035;

function RoleCardView({ role, index }: { role: RoleCard; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * CARD_STAGGER,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        to={`/match/${role.id}`}
        className="group flex h-full flex-col gap-5 rounded-xl border border-hairline bg-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-ambient"
      >
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-body font-medium leading-tight">{role.title}</span>
            <span className="text-meta text-secondary">{role.host} · QSTP</span>
          </div>
          <span className="shrink-0 rounded-full bg-elevated px-2.5 py-1 text-eyebrow font-medium text-secondary">
            {role.employment}
          </span>
        </div>

        {/* one-line need */}
        <p className="line-clamp-2 text-meta leading-relaxed text-secondary">{role.need}</p>

        {/* stats + best-match dial */}
        <div className="mt-auto flex items-end justify-between gap-4">
          <div className="flex gap-6">
            <div className="flex flex-col gap-1">
              <span className="font-display text-h3 tracking-tight">{role.applicants}</span>
              <span className="text-eyebrow text-secondary">Applicants</span>
            </div>
            <div className="flex flex-col gap-1">
              <span
                className={cn(
                  "font-display text-h3 tracking-tight",
                  role.shortlisted > 0 && "text-accent"
                )}
              >
                {role.shortlisted}
              </span>
              <span className="text-eyebrow text-secondary">Shortlisted</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <ScoreDial value={role.topFit} size={48} strokeWidth={4} delay={index * CARD_STAGGER} />
            <span className="text-eyebrow text-secondary">Best fit</span>
          </div>
        </div>

        {/* divider */}
        <div className="h-px bg-hairline" />

        {/* footer */}
        <div className="flex min-h-[30px] items-center justify-between">
          <span className="text-eyebrow text-secondary">
            {role.topName ? `Top match · ${role.topName}` : `${role.capacity} seats open`}
          </span>
          <span className="flex items-center gap-1.5 text-eyebrow font-medium text-secondary opacity-0 transition-opacity duration-200 group-hover:text-accent group-hover:opacity-100">
            Match pool
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------- skeleton -------------------------------- */

function CardSkeleton({ opacity }: { opacity: number }) {
  return (
    <div
      className="flex flex-col gap-5 rounded-xl border border-hairline bg-surface p-6"
      style={{ opacity }}
    >
      <div className="flex flex-col gap-2.5">
        <div className="h-3 w-2/3 rounded-full bg-skeleton" />
        <div className="h-2.5 w-2/5 rounded-full bg-skeleton opacity-70" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-2.5 w-full rounded-full bg-skeleton opacity-60" />
        <div className="h-2.5 w-4/5 rounded-full bg-skeleton opacity-60" />
      </div>
      <div className="mt-2 flex gap-6">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-10 rounded-md bg-skeleton" />
          <div className="h-2 w-14 rounded-full bg-skeleton opacity-60" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-5 w-9 rounded-md bg-skeleton" />
          <div className="h-2 w-16 rounded-full bg-skeleton opacity-60" />
        </div>
      </div>
      <div className="h-px bg-hairline" />
      <div className="h-2.5 w-2/5 rounded-full bg-skeleton opacity-50" />
    </div>
  );
}

/* --------------------------------- page ---------------------------------- */

export default function Dashboard() {
  const { cycle, stats, roles } = useDashboardData();

  // Brief skeleton so the loading treatment is real (mock-first has no latency).
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(!reduce);
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, [reduce]);

  const statItems = [
    { label: "Candidates in pool", value: stats.candidates },
    { label: "Host startups", value: stats.startups },
    { label: "Shortlisted", value: stats.shortlisted, accent: stats.shortlisted > 0 },
    { label: "Unallocated", value: stats.unallocated },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-8 py-12">
      {/* header + primary CTA */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-eyebrow font-medium uppercase tracking-[0.12em] text-secondary">
            {cycle.name}
          </span>
          <h1 className="font-display text-h1 font-normal leading-none tracking-tight">
            Open roles
          </h1>
          <p className="text-body text-secondary">
            {stats.startups} host startups sharing one pool of {stats.candidates} candidates.
          </p>
        </div>
        <Link
          to="/intake"
          className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-meta font-medium text-white transition-colors hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          New role
        </Link>
      </header>

      {/* stats row */}
      <StatsRow items={statItems} />

      {/* role grid */}
      {loading ? (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 0.85, 0.7, 0.55, 0.45, 0.35].map((op, i) => (
            <CardSkeleton key={i} opacity={op} />
          ))}
        </section>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role, i) => (
            <RoleCardView key={role.id} role={role} index={i} />
          ))}
        </section>
      )}
    </div>
  );
}
