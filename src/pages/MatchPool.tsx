import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion, LayoutGroup } from "framer-motion";
import { Gem, ChevronRight, Check, Star, ArrowLeft, SlidersHorizontal, UserX, Mail } from "lucide-react";
import {
  getStartup,
  getMatchesForStartup,
  setShortlistStatus,
} from "@/lib/data";
import type { RankedMatch, ShortlistStatus } from "@/data/types";
import { ScoreDial } from "@/components/score-dial";
import { AuthenticityBadge } from "@/components/authenticity-badge";
import { CandidateDrawer } from "@/components/candidate-drawer";
import { InviteDialog } from "@/components/invite-dialog";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Match Pool — the hero screen. For one host startup, Rubric ranks the whole
   shared candidate pool. Rows reveal with a staggered "AI Match Reveal", dials
   count up, and filter/sort controls reflow the list with layout animation.
   Reads from getMatchesForStartup(); shortlist toggles persist via the data
   layer. Rows are prepared as click targets for the detail drawer (Step 6).
--------------------------------------------------------------------------- */

type SortMode = "fit" | "authenticity" | "gems";

const SORTS: { id: SortMode; label: string }[] = [
  { id: "fit", label: "Fit score" },
  { id: "authenticity", label: "Most human" },
  { id: "gems", label: "Hidden gems" },
];

const STAGGER = 0.035;

const GRID =
  "grid grid-cols-[28px_48px_minmax(0,1fr)_minmax(0,1.25fr)_auto_92px] items-center gap-4";

export default function MatchPool() {
  const { startupId } = useParams();
  const reduce = useReducedMotion();

  const startup = startupId ? getStartup(startupId) : undefined;

  // Snapshot the ranked list once; keep shortlist state locally so toggles
  // re-render immediately while still persisting through the data layer.
  const [matches, setMatches] = useState<RankedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>("fit");
  const [gemsOnly, setGemsOnly] = useState(false);
  const [shortlistedOnly, setShortlistedOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    if (!startupId) return;
    setLoading(true);
    setMatches(getMatchesForStartup(startupId));
    const t = setTimeout(() => setLoading(false), reduce ? 0 : 460);
    return () => clearTimeout(t);
  }, [startupId, reduce]);

  const toggleShortlist = (m: RankedMatch) => {
    const next: ShortlistStatus =
      m.shortlistStatus === "shortlisted" ? "under_review" : "shortlisted";
    setShortlistStatus(m.id, next);
    setMatches((prev) =>
      prev.map((x) => (x.id === m.id ? { ...x, shortlistStatus: next } : x))
    );
  };

  const rows = useMemo(() => {
    let r = matches.slice();
    if (gemsOnly) r = r.filter((m) => m.isHiddenGem);
    if (shortlistedOnly) r = r.filter((m) => m.shortlistStatus === "shortlisted");
    r.sort((a, b) => {
      if (sort === "authenticity") return a.authenticityScore - b.authenticityScore;
      if (sort === "gems") {
        if (a.isHiddenGem !== b.isHiddenGem) return a.isHiddenGem ? -1 : 1;
        return b.fitScore - a.fitScore;
      }
      return b.fitScore - a.fitScore;
    });
    return r;
  }, [matches, sort, gemsOnly, shortlistedOnly]);

  const gemCount = matches.filter((m) => m.isHiddenGem).length;
  const shortlistedCount = matches.filter((m) => m.shortlistStatus === "shortlisted").length;

  // Candidates the "Invite shortlisted" action targets: everyone the recruiter
  // has starred for this role. The dialog previews an interview invitation and
  // shows a simulated "N invitations sent" — nothing actually leaves the browser.
  const inviteTargets = useMemo(
    () => matches.filter((m) => m.shortlistStatus === "shortlisted"),
    [matches]
  );
  const canInvite = inviteTargets.length > 0;

  // The drawer reads the *live* match from state (so its shortlist toggle
  // stays in sync with the row). Rank reflects position in the current view.
  const selectedMatch = selectedId ? matches.find((m) => m.id === selectedId) ?? null : null;
  const selectedRank = selectedMatch ? rows.findIndex((m) => m.id === selectedMatch.id) + 1 : 0;

  if (!startup) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-8 py-20">
        <h1 className="font-display text-h2 font-normal">Startup not found</h1>
        <p className="text-body text-secondary">
          No host startup matches "{startupId}".
        </p>
        <Link to="/dashboard" className="flex items-center gap-2 text-meta font-medium text-accent">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.8} /> Back to open roles
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-7 px-8 py-10">
      {/* header */}
      <header className="flex flex-col gap-6">
        <Link
          to="/dashboard"
          className="flex w-fit items-center gap-2 text-meta text-secondary transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.8} /> Open roles
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-eyebrow font-medium uppercase tracking-[0.12em] text-secondary">
              Match pool → {startup.roleTitle}
            </span>
            <h1 className="font-display text-h1 font-normal leading-none tracking-tight">
              {startup.name}
            </h1>
            <p className="max-w-[60ch] text-body text-secondary">
              {matches.length} applicants from the shared pool, ranked for this role ·{" "}
              {gemCount} hidden {gemCount === 1 ? "gem" : "gems"} surfaced.
            </p>
          </div>

          <button
            onClick={() => setInviteOpen(true)}
            disabled={!canInvite}
            title={
              canInvite
                ? `Invite ${inviteTargets.length} shortlisted to interview`
                : "Shortlist at least one candidate first"
            }
            className={cn(
              "flex h-10 items-center gap-2 rounded-lg px-4 text-meta font-medium transition-colors",
              canInvite
                ? "bg-accent text-white hover:bg-accent-hover"
                : "cursor-not-allowed border border-hairline text-secondary opacity-60"
            )}
          >
            <Mail className="h-4 w-4" strokeWidth={1.8} />
            Invite shortlisted
            {inviteTargets.length > 0 && (
              <span className="opacity-80">({inviteTargets.length})</span>
            )}
          </button>
        </div>
      </header>

      {/* controls */}
      <div className="flex flex-wrap items-center gap-3 border-y border-hairline py-3">
        {/* filter chips */}
        <FilterChip active={gemsOnly} onClick={() => setGemsOnly((v) => !v)}>
          <Gem className="h-3.5 w-3.5" strokeWidth={1.8} />
          Hidden gems
          <span className="opacity-60">{gemCount}</span>
        </FilterChip>
        <FilterChip active={shortlistedOnly} onClick={() => setShortlistedOnly((v) => !v)}>
          <Star className="h-3.5 w-3.5" strokeWidth={1.8} />
          Shortlisted
          <span className="opacity-60">{shortlistedCount}</span>
        </FilterChip>

        {/* sort */}
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-meta text-secondary">
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.8} /> Sort
          </span>
          <div className="flex items-center gap-1 rounded-lg border border-hairline p-1">
            {SORTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                className="relative rounded-md px-2.5 py-1 text-meta font-medium transition-colors"
              >
                {sort === s.id && (
                  <motion.span
                    layoutId="sort-active"
                    className="absolute inset-0 rounded-md bg-accent-soft"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={cn("relative", sort === s.id ? "text-accent" : "text-secondary")}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* column header */}
      <div className={cn(GRID, "px-2 pb-1 text-eyebrow font-medium uppercase tracking-[0.1em] text-secondary")}>
        <span>#</span>
        <span>Fit</span>
        <span>Candidate</span>
        <span>Why they fit</span>
        <span>Authenticity</span>
        <span />
      </div>

      {/* list + drawer share one LayoutGroup so the ScoreDial can morph */}
      <LayoutGroup>
        {loading ? (
          <div className="flex flex-col">
            {[1, 0.92, 0.82, 0.7, 0.58, 0.45, 0.32].map((op, i) => (
              <RowSkeleton key={i} opacity={op} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-body text-secondary">
            No candidates match these filters.
          </div>
        ) : (
          <div className="flex flex-col">
            {rows.map((m, i) => (
              <CandidateRow
                key={m.id}
                match={m}
                rank={i + 1}
                index={i}
                selected={selectedId === m.id}
                reduce={!!reduce}
                onSelect={() => setSelectedId((cur) => (cur === m.id ? null : m.id))}
                onToggleShortlist={() => toggleShortlist(m)}
              />
            ))}
          </div>
        )}

        <AnimatePresence>
          {selectedMatch && (
            <CandidateDrawer
              key={selectedMatch.id}
              match={selectedMatch}
              startup={startup}
              rank={selectedRank}
              total={matches.length}
              onClose={() => setSelectedId(null)}
              onToggleShortlist={() => toggleShortlist(selectedMatch)}
            />
          )}
        </AnimatePresence>
      </LayoutGroup>

      <AnimatePresence>
        {inviteOpen && (
          <InviteDialog
            startup={startup}
            targets={inviteTargets}
            onCancel={() => setInviteOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------ candidate row ------------------------------ */

function CandidateRow({
  match,
  rank,
  index,
  selected,
  reduce,
  onSelect,
  onToggleShortlist,
}: {
  match: RankedMatch;
  rank: number;
  index: number;
  selected: boolean;
  reduce: boolean;
  onSelect: () => void;
  onToggleShortlist: () => void;
}) {
  const { application: app } = match;
  const shortlisted = match.shortlistStatus === "shortlisted";
  const rejected = match.shortlistStatus === "rejected";
  const flagged = match.authenticityScore >= 66;

  return (
    <motion.div
      layout
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        layout: { type: "spring", stiffness: 500, damping: 40 },
        delay: reduce ? 0 : index * STAGGER,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group cursor-pointer border-b border-hairline transition-colors",
        selected ? "bg-accent-soft shadow-[inset_2px_0_0_var(--accent)]" : "hover:bg-row-hover",
        flagged && !selected && !rejected && "bg-auth-red-soft",
        rejected && !selected && "opacity-55"
      )}
    >
      <div className={cn(GRID, "px-2 py-3.5")}>
        {/* rank */}
        <span className="font-mono text-meta text-secondary">
          {String(rank).padStart(2, "0")}
        </span>

        {/* dial — shared element that morphs into the drawer */}
        <motion.div layoutId={reduce ? undefined : `dial-${match.id}`} className="w-fit">
          <ScoreDial value={match.fitScore} size={44} strokeWidth={3.5} delay={index * STAGGER} />
        </motion.div>

        {/* candidate */}
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-body font-medium">{app.name}</span>
            {match.isHiddenGem && !rejected && (
              <span className="flex flex-none items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-eyebrow font-medium text-accent">
                <Gem className="h-3 w-3" strokeWidth={1.8} /> Hidden gem
              </span>
            )}
            {rejected && (
              <span className="flex flex-none items-center gap-1 rounded-full bg-auth-red-soft px-2 py-0.5 text-eyebrow font-medium text-auth-red">
                <UserX className="h-3 w-3" strokeWidth={1.8} /> Rejected
              </span>
            )}
          </div>
          <span className="truncate text-meta text-secondary">
            {app.major} · {app.year} · GPA {app.gpa.toFixed(1)}
          </span>
        </div>

        {/* fit reasons */}
        <div className="flex min-w-0 flex-col gap-1">
          {match.fitReasons.slice(0, 2).map((r, ri) => (
            <span key={ri} className="flex items-start gap-1.5 text-meta text-secondary">
              <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-accent" />
              <span className="line-clamp-1">{r}</span>
            </span>
          ))}
          {match.fitReasons.length > 2 && (
            <span className="pl-2.5 text-eyebrow text-secondary">
              +{match.fitReasons.length - 2} more
            </span>
          )}
        </div>

        {/* authenticity */}
        <AuthenticityBadge pct={match.authenticityScore} />

        {/* actions */}
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleShortlist();
            }}
            title={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-lg border transition-colors",
              shortlisted
                ? "border-accent bg-accent text-white"
                : "border-hairline text-secondary hover:border-accent hover:text-accent"
            )}
          >
            {shortlisted ? (
              <Check className="h-4 w-4" strokeWidth={2} />
            ) : (
              <Star className="h-4 w-4" strokeWidth={1.8} />
            )}
          </button>
          <ChevronRight
            className={cn(
              "h-4 w-4 text-secondary transition-transform",
              selected && "translate-x-0.5 text-accent"
            )}
            strokeWidth={1.8}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------- helpers -------------------------------- */

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-full border px-3 text-meta font-medium transition-colors",
        active
          ? "border-transparent bg-accent-soft text-accent"
          : "border-hairline text-secondary hover:border-accent hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

function RowSkeleton({ opacity }: { opacity: number }) {
  return (
    <div className={cn(GRID, "border-b border-hairline px-2 py-4")} style={{ opacity }}>
      <div className="h-2.5 w-4 rounded-full bg-skeleton" />
      <div className="h-9 w-9 rounded-full bg-skeleton" />
      <div className="flex flex-col gap-2">
        <div className="h-2.5 w-1/2 rounded-full bg-skeleton" />
        <div className="h-2 w-1/3 rounded-full bg-skeleton opacity-60" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-2 w-4/5 rounded-full bg-skeleton opacity-60" />
        <div className="h-2 w-3/5 rounded-full bg-skeleton opacity-60" />
      </div>
      <div className="h-6 w-20 rounded-full bg-skeleton" />
      <div className="ml-auto h-8 w-8 rounded-lg bg-skeleton" />
    </div>
  );
}
