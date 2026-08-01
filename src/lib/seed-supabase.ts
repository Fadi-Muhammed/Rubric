import { supabase } from "./supabase";
import {
  applications as seedApplications,
  cycle as seedCycle,
  matches as seedMatches,
  startups as seedStartups,
} from "@/data/seed";

/* ============================================================
   One-shot Supabase seeder.

   Populates a freshly-migrated project (see supabase/migrations/0001_init.sql)
   with the exact same data the mock layer uses, so a Supabase-backed build is
   indistinguishable from the demo. Idempotent: upserts by primary key.

   Run once from the browser console after configuring .env:
     import("@/lib/seed-supabase").then(m => m.seedSupabase())
   ============================================================ */

export async function seedSupabase(): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured — set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY");

  const cycleRow = {
    id: seedCycle.id,
    name: seedCycle.name,
    status: seedCycle.status,
    public_slug: seedCycle.publicSlug,
    created_at: seedCycle.createdAt,
  };

  const startupRows = seedStartups.map((s) => ({
    id: s.id,
    cycle_id: s.cycleId,
    name: s.name,
    role_title: s.roleTitle,
    needs_description: s.needsDescription,
    employment_type: s.employmentType,
    capacity: s.capacity,
    skills_wanted: s.skillsWanted,
    created_at: s.createdAt,
  }));

  const questionRows = seedCycle.screeningQuestions.map((q) => ({
    id: q.id,
    cycle_id: seedCycle.id,
    text: q.text,
    sort_order: q.sortOrder,
  }));

  const applicationRows = seedApplications.map((a) => ({
    id: a.id,
    cycle_id: a.cycleId,
    name: a.name,
    email: a.email,
    major: a.major,
    year: a.year,
    gpa: a.gpa,
    skills: a.skills,
    blurb: a.blurb,
    answers: a.answers,
    resume_file_name: a.resumeFileName,
    ai_authenticity_score: a.aiAuthenticityScore,
    ai_authenticity_rationale: a.aiAuthenticityRationale,
    created_at: a.createdAt,
  }));

  const matchRows = seedMatches.map((m) => ({
    id: m.id,
    application_id: m.applicationId,
    startup_id: m.startupId,
    fit_score: m.fitScore,
    fit_reasons: m.fitReasons,
    is_hidden_gem: m.isHiddenGem,
    authenticity_score: m.authenticityScore,
    shortlist_status: m.shortlistStatus,
  }));

  // Order matters: parents before children (FK constraints).
  const steps: [string, unknown][] = [
    ["cycles", [cycleRow]],
    ["startups", startupRows],
    ["screening_qs", questionRows],
    ["applications", applicationRows],
    ["matches", matchRows],
  ];

  for (const [table, rows] of steps) {
    const { error } = await supabase.from(table).upsert(rows as never[]);
    if (error) throw new Error(`Seeding ${table} failed: ${error.message}`);
    // eslint-disable-next-line no-console
    console.log(`✓ seeded ${table} (${(rows as unknown[]).length} rows)`);
  }

  // eslint-disable-next-line no-console
  console.log("Supabase seed complete.");
}
