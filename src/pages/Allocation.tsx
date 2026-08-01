import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Wand2, RotateCcw, Flame, GripVertical, Users } from "lucide-react";
import {
  listStartups,
  listApplications,
  listMatches,
  listAllocations,
  setAllocation,
  removeAllocation,
  clearAllocations,
} from "@/lib/data";
import type { Application, Match } from "@/data/types";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Allocation Board — Rubric's headline. Every host startup is a column; the
   whole shared pool starts on the bench. "Auto-allocate" runs a GREEDY, seeded
   assignment (best global fit first, no candidate placed twice, capacity
   respected) and the cards slide into their columns with a staggered reveal.
   Contested candidates (a top-3 pick for 2+ roles) are flagged. Drag any card
   between columns to override — every move persists through the data layer.
   Deliberately greedy, not an optimizer.
--------------------------------------------------------------------------- */

const BENCH = "bench";
const STAGGER = 0.03;

type ColumnId = string; // startup id or BENCH

export default function Allocation() {
  const reduce = useReducedMotion();

  const startups = useMemo(() => listStartups(), []);
  const apps = useMemo(() => listApplications(), []);
  const allMatches = useMemo(() => listMatches(), []);

  // (appId|startupId) -> Match, for O(1) fit lookups.
  const matchMap = useMemo(() => {
    const m = new Map<string, Match>();
    for (const x of allMatches) m.set(`${x.applicationId}|${x.startupId}`, x);
    return m;
  }, [allMatches]);
  const fitOf = (appId: string, stId: string) =>
    matchMap.get(`${appId}|${stId}`)?.fitScore ?? 0;

  // A candidate's single best fit across all roles (shown on the bench).
  const bestFit = useMemo(() => {
    const m = new Map<string, { fit: number; stId: string }>();
    for (const x of allMatches) {
      const cur = m.get(x.applicationId);
      if (!cur || x.fitScore > cur.fit) m.set(x.applicationId, { fit: x.fitScore, stId: x.startupId });
    }
    return m;
  }, [allMatches]);

  // Contested = a top-5 candidate for two or more different roles: the people
  // several startups would each greedily reach for.
  const contested = useMemo(() => {
    const count: Record<string, number> = {};
    for (const st of startups) {
      const top = allMatches
        .filter((x) => x.startupId === st.id)
        .sort((a, b) => b.fitScore - a.fitScore)
        .slice(0, 5);
      for (const x of top) count[x.applicationId] = (count[x.applicationId] ?? 0) + 1;
    }
    return new Set(Object.keys(count).filter((id) => count[id] >= 2));
  }, [startups, allMatches]);

  // appId -> columnId. Seeded from any existing allocations (survives nav).
  const [assign, setAssign] = useState<Record<string, ColumnId>>(() => {
    const init: Record<string, ColumnId> = {};
    for (const a of listAllocations()) init[a.applicationId] = a.startupId;
    return init;
  });
  // Bumped on each auto-allocate so the reveal re-staggers.
  const [runId, setRunId] = useState(0);
  const [dragId, setDragId] = useState<string | null>(null);

  const capacityOf = (colId: string) =>
    colId === BENCH ? Infinity : startups.find((s) => s.id === colId)?.capacity ?? 0;

  // Cards grouped by column, sorted best-fit first (per-column relevance).
  const columns = useMemo(() => {
    const cols: Record<string, string[]> = { [BENCH]: [] };
    for (const st of startups) cols[st.id] = [];
    for (const app of apps) (cols[assign[app.id] ?? BENCH] ??= []).push(app.id);
    for (const [colId, ids] of Object.entries(cols)) {
      ids.sort((a, b) => {
        const fa = colId === BENCH ? bestFit.get(a)?.fit ?? 0 : fitOf(a, colId);
        const fb = colId === BENCH ? bestFit.get(b)?.fit ?? 0 : fitOf(b, colId);
        return fb - fa;
      });
    }
    return cols;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assign, startups, apps, bestFit]);

  const allocatedCount = apps.length - columns[BENCH].length;
  const contestedPlaced = [...contested].filter((id) => assign[id]).length;

  /* --------------------------- greedy allocation --------------------------- */
  const autoAllocate = () => {
    clearAllocations();
    const pairs = allMatches
      .slice()
      .sort(
        (a, b) =>
          b.fitScore - a.fitScore || a.applicationId.localeCompare(b.applicationId)
      );
    const next: Record<string, ColumnId> = {};
    const filled: Record<string, number> = {};
    for (const m of pairs) {
      if (next[m.applicationId]) continue; // candidate already placed
      if ((filled[m.startupId] ?? 0) >= capacityOf(m.startupId)) continue; // role full
      next[m.applicationId] = m.startupId;
      filled[m.startupId] = (filled[m.startupId] ?? 0) + 1;
      setAllocation(m.applicationId, m.startupId);
    }
    setAssign(next);
    setRunId((r) => r + 1);
  };

  const resetBoard = () => {
    clearAllocations();
    setAssign({});
    setRunId((r) => r + 1);
  };

  /* ------------------------------ drag override ---------------------------- */
  const colRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const moveTo = (appId: string, colId: ColumnId) => {
    setAssign((prev) => {
      const n = { ...prev };
      if (colId === BENCH) delete n[appId];
      else n[appId] = colId;
      return n;
    });
    if (colId === BENCH) removeAllocation(appId);
    else setAllocation(appId, colId);
  };

  const handleDrop = (appId: string, point: { x: number; y: number }) => {
    let target: ColumnId | null = null;
    for (const [colId, el] of Object.entries(colRefs.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom) {
        target = colId;
        break;
      }
    }
    if (target && target !== (assign[appId] ?? BENCH)) moveTo(appId, target);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-5 px-8 py-8">
      {/* header */}
      <header className="flex flex-none flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-eyebrow font-medium uppercase tracking-[0.12em] text-secondary">
            Allocation Board
          </span>
          <h1 className="font-display text-h1 font-normal leading-none tracking-tight">
            One pool, every role
          </h1>
          <p className="max-w-[64ch] text-body text-secondary">
            {allocatedCount} of {apps.length} candidates allocated across {startups.length} host
            startups · {contested.size} contested {contested.size === 1 ? "pick" : "picks"} to watch.
            Drag any card to override.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={resetBoard}
            disabled={allocatedCount === 0}
            className="flex h-10 items-center gap-2 rounded-lg border border-hairline px-4 text-meta font-medium text-secondary transition-colors hover:border-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
            Reset
          </button>
          <button
            onClick={autoAllocate}
            className="flex h-10 items-center gap-2 rounded-lg bg-accent px-5 text-meta font-medium text-white transition-colors hover:bg-accent-hover"
          >
            <Wand2 className="h-4 w-4" strokeWidth={1.8} />
            Auto-allocate
          </button>
        </div>
      </header>

      {/* board */}
      <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto pb-2">
        {/* bench */}
        <BoardColumn
          innerRef={(el) => (colRefs.current[BENCH] = el)}
          title="Candidate pool"
          subtitle={`${columns[BENCH].length} on the bench`}
          Icon={Users}
          bench
        >
          {columns[BENCH].map((appId, i) => (
            <CandidateCard
              key={appId}
              app={apps.find((a) => a.id === appId)!}
              colId={BENCH}
              index={i}
              runId={runId}
              fit={bestFit.get(appId)?.fit ?? 0}
              fitLabel={
                bestFit.get(appId)
                  ? `best · ${startups.find((s) => s.id === bestFit.get(appId)!.stId)?.name.split(" ")[0]}`
                  : "no fit"
              }
              contested={contested.has(appId)}
              reduce={!!reduce}
              dragging={dragId === appId}
              onDragStart={() => setDragId(appId)}
              onDragEnd={(pt) => {
                setDragId(null);
                handleDrop(appId, pt);
              }}
            />
          ))}
        </BoardColumn>

        {/* startup columns */}
        {startups.map((st) => {
          const ids = columns[st.id];
          const over = ids.length > st.capacity;
          return (
            <BoardColumn
              key={st.id}
              innerRef={(el) => (colRefs.current[st.id] = el)}
              title={st.name}
              subtitle={st.roleTitle}
              capacityLabel={`${ids.length} / ${st.capacity}`}
              over={over}
            >
              {ids.length === 0 ? (
                <EmptySlot />
              ) : (
                ids.map((appId, i) => (
                  <CandidateCard
                    key={appId}
                    app={apps.find((a) => a.id === appId)!}
                    colId={st.id}
                    index={i}
                    runId={runId}
                    fit={fitOf(appId, st.id)}
                    fitLabel="fit"
                    contested={contested.has(appId)}
                    reduce={!!reduce}
                    dragging={dragId === appId}
                    onDragStart={() => setDragId(appId)}
                    onDragEnd={(pt) => {
                      setDragId(null);
                      handleDrop(appId, pt);
                    }}
                  />
                ))
              )}
            </BoardColumn>
          );
        })}
      </div>

      {/* legend */}
      <div className="flex flex-none items-center gap-5 text-eyebrow text-secondary">
        <span className="flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-auth-amber" strokeWidth={1.8} /> Contested — top-3 for
          multiple roles {contestedPlaced > 0 && `(${contestedPlaced} placed)`}
        </span>
        <span className="flex items-center gap-1.5">
          <GripVertical className="h-3.5 w-3.5" strokeWidth={1.8} /> Drag to override · persists to
          the data layer
        </span>
        <span className="text-secondary/80">Greedy assignment — intentionally not an optimizer.</span>
      </div>
    </div>
  );
}

/* ------------------------------ column shell ------------------------------ */

const BoardColumn = ({
  innerRef,
  title,
  subtitle,
  capacityLabel,
  over,
  bench,
  Icon,
  children,
}: {
  innerRef: (el: HTMLDivElement | null) => void;
  title: string;
  subtitle?: string;
  capacityLabel?: string;
  over?: boolean;
  bench?: boolean;
  Icon?: typeof Users;
  children: React.ReactNode;
}) => {
  return (
    <div
      ref={innerRef}
      className={cn(
        "flex w-[230px] flex-none flex-col rounded-2xl border transition-colors",
        bench ? "border-hairline bg-surface" : "border-hairline bg-elevated",
        over && "border-auth-amber"
      )}
    >
      <div className="flex flex-none items-start justify-between gap-2 border-b border-hairline p-3.5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="flex items-center gap-1.5 truncate text-meta font-semibold text-ink">
            {Icon && <Icon className="h-3.5 w-3.5 flex-none text-secondary" strokeWidth={1.8} />}
            {title}
          </span>
          {subtitle && <span className="truncate text-eyebrow text-secondary">{subtitle}</span>}
        </div>
        {capacityLabel && (
          <span
            className={cn(
              "flex-none rounded-full px-2 py-0.5 text-eyebrow font-medium",
              over ? "bg-auth-amber-soft text-auth-amber" : "bg-skeleton text-secondary"
            )}
          >
            {capacityLabel}
          </span>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2.5">{children}</div>
    </div>
  );
};

function EmptySlot() {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-hairline px-3 py-6 text-center text-eyebrow text-secondary">
      Empty — auto-allocate or drop a candidate here
    </div>
  );
}

/* ------------------------------ candidate card ------------------------------ */

function CandidateCard({
  app,
  colId,
  index,
  runId,
  fit,
  fitLabel,
  contested,
  reduce,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  app: Application;
  colId: ColumnId;
  index: number;
  runId: number;
  fit: number;
  fitLabel: string;
  contested: boolean;
  reduce: boolean;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: (point: { x: number; y: number }) => void;
}) {
  const flagged = app.aiAuthenticityScore >= 66;
  return (
    <motion.div
      layout={!reduce}
      drag
      dragSnapToOrigin
      dragElastic={0.16}
      whileDrag={{ scale: 1.04, zIndex: 50, cursor: "grabbing" }}
      onDragStart={onDragStart}
      onDragEnd={(_, info) => onDragEnd(info.point)}
      transition={{ layout: { type: "spring", stiffness: 520, damping: 42 } }}
      className={cn(
        "relative cursor-grab touch-none select-none rounded-xl border bg-canvas p-2.5",
        contested ? "border-auth-amber/70" : "border-hairline",
        dragging && "shadow-ambient"
      )}
    >
      {/* staggered reveal: inner remounts when the column changes */}
      <motion.div
        key={`${colId}-${runId}`}
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduce ? 0 : index * STAGGER, duration: 0.28 }}
        className="flex flex-col gap-1.5"
      >
        <div className="flex items-center gap-1.5">
          <GripVertical className="h-3.5 w-3.5 flex-none text-secondary/60" strokeWidth={1.8} />
          <span className="min-w-0 flex-1 truncate text-meta font-medium">{app.name}</span>
          {contested && (
            <Flame
              className="h-3.5 w-3.5 flex-none text-auth-amber"
              strokeWidth={1.8}
              aria-label="Contested pick"
            />
          )}
        </div>
        <div className="flex items-center justify-between gap-2 pl-5">
          <span className="truncate text-eyebrow text-secondary">
            {app.major} · GPA {app.gpa.toFixed(1)}
          </span>
          <span className="flex flex-none items-center gap-1.5">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                flagged ? "bg-auth-red" : "bg-auth-green"
              )}
              title={`${app.aiAuthenticityScore}% AI-written`}
            />
            <span className="font-mono text-eyebrow font-medium text-ink">{fit}</span>
            <span className="text-eyebrow text-secondary">{fitLabel}</span>
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
