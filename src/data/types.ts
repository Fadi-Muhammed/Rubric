/**
 * Rubric domain types — mock-first.
 * Field names track BUILD.md §10 (the eventual Supabase schema) but use
 * camelCase and a few denormalized convenience fields for the in-memory demo.
 */

export type CycleStatus = "draft" | "live" | "closed";
export type EmploymentType = "full_time" | "part_time";
export type ShortlistStatus = "under_review" | "shortlisted" | "rejected";
export type AllocationStatus = "assigned" | "confirmed";

export interface ScreeningQuestion {
  id: string;
  text: string;
  sortOrder: number;
}

export interface Cycle {
  id: string;
  name: string;
  status: CycleStatus;
  /** Public application link slug: /apply/:publicSlug */
  publicSlug: string;
  coverLetterEnabled: boolean;
  screeningQuestions: ScreeningQuestion[];
  createdAt: string;
}

export interface Startup {
  id: string;
  cycleId: string;
  name: string;
  roleTitle: string;
  needsDescription: string;
  employmentType: EmploymentType;
  /** How many interns this startup can take (used by the Allocation Board). */
  capacity: number;
  /** Skills this role is matched against. */
  skillsWanted: string[];
  createdAt: string;
}

export interface Application {
  id: string;
  cycleId: string;
  name: string;
  email: string;
  gpa: number;
  /** Academic year, e.g. "3rd year". */
  year: string;
  major: string;
  skills: string[];
  /** Short candidate summary shown in rows/drawers. */
  blurb: string;
  /** Answers to the cycle's screening questions, keyed by question id. */
  answers: Record<string, string>;
  resumeFileName: string;
  /** 0 = human, 100 = AI-written. Canonical source of the authenticity score. */
  aiAuthenticityScore: number;
  aiAuthenticityRationale: string;
  createdAt: string;
}

export interface Match {
  id: string;
  applicationId: string;
  startupId: string;
  fitScore: number; // 0–100
  fitReasons: string[];
  isHiddenGem: boolean;
  shortlistStatus: ShortlistStatus;
  /** Denormalized mirror of the application's authenticity score for easy row rendering. */
  authenticityScore: number;
}

export interface Allocation {
  id: string;
  cycleId: string;
  applicationId: string;
  startupId: string;
  status: AllocationStatus;
}

/** A match joined with its candidate — what the Match Pool / drawer render. */
export interface RankedMatch extends Match {
  application: Application;
}
