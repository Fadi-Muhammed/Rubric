import type {
  Allocation,
  Application,
  Cycle,
  Match,
  RankedMatch,
  ShortlistStatus,
  Startup,
} from "@/data/types";
import {
  applications as seedApplications,
  buildMatch,
  cycle as seedCycle,
  matches as seedMatches,
  startups as seedStartups,
} from "@/data/seed";

/* ============================================================
   Mock-first data layer.
   In-memory state seeded from src/data/seed.ts. Writes mutate
   this state so the UI feels live within a session. Same function
   signatures will back onto Supabase in Step 10 — screens won't change.
   ============================================================ */

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

const db = {
  cycle: clone(seedCycle) as Cycle,
  startups: clone(seedStartups) as Startup[],
  applications: clone(seedApplications) as Application[],
  matches: clone(seedMatches) as Match[],
  allocations: [] as Allocation[],
};

let seq = db.applications.length;

/* ------------------------------ reads ------------------------------ */

export function getCycle(): Cycle {
  return db.cycle;
}

export function listStartups(): Startup[] {
  return db.startups;
}

export function getStartup(id: string): Startup | undefined {
  return db.startups.find((s) => s.id === id);
}

export function listApplications(): Application[] {
  return db.applications;
}

export function getApplication(id: string): Application | undefined {
  return db.applications.find((a) => a.id === id);
}

export function listMatches(): Match[] {
  return db.matches;
}

/** Ranked candidates for one startup (joined with the application), best first. */
export function getMatchesForStartup(startupId: string): RankedMatch[] {
  return db.matches
    .filter((m) => m.startupId === startupId)
    .map((m) => ({
      ...m,
      application: db.applications.find((a) => a.id === m.applicationId)!,
    }))
    .filter((m) => m.application) // guard against orphans
    .sort((a, b) => b.fitScore - a.fitScore);
}

/** All hidden-gem matches across the whole pool. */
export function listHiddenGems(): RankedMatch[] {
  return db.matches
    .filter((m) => m.isHiddenGem)
    .map((m) => ({
      ...m,
      application: db.applications.find((a) => a.id === m.applicationId)!,
    }))
    .sort((a, b) => b.fitScore - a.fitScore);
}

export function listAllocations(): Allocation[] {
  return db.allocations;
}

/* ------------------------------ stats ------------------------------ */

export interface CycleStats {
  candidates: number;
  startups: number;
  matches: number;
  shortlisted: number;
  hiddenGems: number;
  allocated: number;
  unallocated: number;
}

export function getCycleStats(): CycleStats {
  const shortlisted = new Set(
    db.matches.filter((m) => m.shortlistStatus === "shortlisted").map((m) => m.applicationId)
  ).size;
  const allocated = db.allocations.length;
  return {
    candidates: db.applications.length,
    startups: db.startups.length,
    matches: db.matches.length,
    shortlisted,
    hiddenGems: db.matches.filter((m) => m.isHiddenGem).length,
    allocated,
    unallocated: db.applications.length - allocated,
  };
}

/* ------------------------------ writes ------------------------------ */

/** Toggle/set the per-startup shortlist status on a match. */
export function setShortlistStatus(matchId: string, status: ShortlistStatus): Match | undefined {
  const m = db.matches.find((x) => x.id === matchId);
  if (m) m.shortlistStatus = status;
  return m;
}

/** Reject every non-shortlisted candidate for a startup; returns rejected app ids. */
export function rejectNonShortlisted(startupId: string): string[] {
  const rejected: string[] = [];
  for (const m of db.matches) {
    if (m.startupId === startupId && m.shortlistStatus === "under_review") {
      m.shortlistStatus = "rejected";
      rejected.push(m.applicationId);
    }
  }
  return rejected;
}

export type NewApplicationInput = Omit<
  Application,
  "id" | "cycleId" | "createdAt" | "resumeFileName"
> & { resumeFileName?: string };

/**
 * Add a candidate to the pool and generate their matches against every
 * startup, so they immediately appear in the relevant Match Pools.
 */
export function addApplication(input: NewApplicationInput): Application {
  seq += 1;
  const app: Application = {
    ...input,
    id: `app-${String(seq).padStart(2, "0")}`,
    cycleId: db.cycle.id,
    resumeFileName: input.resumeFileName ?? `${input.name.toLowerCase().replace(/\s+/g, "-")}-resume.pdf`,
    createdAt: new Date().toISOString(),
  };
  db.applications.push(app);
  for (const st of db.startups) db.matches.push(buildMatch(app, st));
  return app;
}

/** Assign a candidate to a startup (used by the Allocation Board later). */
export function setAllocation(applicationId: string, startupId: string): Allocation {
  const existing = db.allocations.find((a) => a.applicationId === applicationId);
  if (existing) {
    existing.startupId = startupId;
    return existing;
  }
  const alloc: Allocation = {
    id: `al-${applicationId}`,
    cycleId: db.cycle.id,
    applicationId,
    startupId,
    status: "assigned",
  };
  db.allocations.push(alloc);
  return alloc;
}

export function clearAllocations(): void {
  db.allocations = [];
}
