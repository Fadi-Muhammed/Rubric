-- Rubric — initial schema (Step 10)
-- Mirrors BUILD.md §10 and src/data/types.ts. Run in the Supabase SQL editor
-- (or `supabase db push`). All ids are text to match the seed layer's slugs
-- (e.g. "st-sadeem", "app-01") so a seed import maps 1:1.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- cycles
-- ---------------------------------------------------------------------------
create table if not exists cycles (
  id          text primary key,
  name        text not null,
  status      text not null default 'draft'
              check (status in ('draft', 'live', 'closed')),
  public_slug text unique,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- startups (host roles)
-- ---------------------------------------------------------------------------
create table if not exists startups (
  id                text primary key,
  cycle_id          text not null references cycles(id) on delete cascade,
  name              text not null,
  role_title        text not null,
  needs_description text not null default '',
  employment_type   text not null default 'internship',
  capacity          int  not null default 1 check (capacity >= 0),
  skills_wanted     jsonb not null default '[]'::jsonb,
  created_at        timestamptz not null default now()
);
create index if not exists startups_cycle_idx on startups(cycle_id);

-- ---------------------------------------------------------------------------
-- screening_qs (per-cycle screening questions)
-- ---------------------------------------------------------------------------
create table if not exists screening_qs (
  id         text primary key,
  cycle_id   text not null references cycles(id) on delete cascade,
  text       text not null,
  sort_order int  not null default 0
);
create index if not exists screening_qs_cycle_idx on screening_qs(cycle_id);

-- ---------------------------------------------------------------------------
-- applications (shared candidate pool)
-- ---------------------------------------------------------------------------
create table if not exists applications (
  id                        text primary key,
  cycle_id                  text not null references cycles(id) on delete cascade,
  name                      text not null,
  email                     text,
  major                     text,
  year                      text,
  gpa                       numeric(3,2),
  skills                    jsonb not null default '[]'::jsonb,
  blurb                     text,
  answers                   jsonb not null default '{}'::jsonb,
  resume_file_name          text,
  ai_authenticity_score     int,
  ai_authenticity_rationale text,
  created_at                timestamptz not null default now()
);
create index if not exists applications_cycle_idx on applications(cycle_id);

-- ---------------------------------------------------------------------------
-- matches (candidate × startup grid — the heart of Rubric)
-- ---------------------------------------------------------------------------
create table if not exists matches (
  id                 text primary key,
  application_id     text not null references applications(id) on delete cascade,
  startup_id         text not null references startups(id) on delete cascade,
  fit_score          int  not null default 0,
  fit_reasons        jsonb not null default '[]'::jsonb,
  is_hidden_gem      bool not null default false,
  authenticity_score int,
  shortlist_status   text not null default 'under_review'
                     check (shortlist_status in ('under_review', 'shortlisted', 'rejected')),
  unique (application_id, startup_id)
);
create index if not exists matches_startup_idx on matches(startup_id);
create index if not exists matches_application_idx on matches(application_id);

-- ---------------------------------------------------------------------------
-- allocations (Allocation Board's final assignment — one row per assigned candidate)
-- ---------------------------------------------------------------------------
create table if not exists allocations (
  id             text primary key,
  cycle_id       text not null references cycles(id) on delete cascade,
  application_id text not null references applications(id) on delete cascade,
  startup_id     text not null references startups(id) on delete cascade,
  status         text not null default 'assigned'
                 check (status in ('assigned', 'confirmed')),
  unique (application_id)
);
create index if not exists allocations_cycle_idx on allocations(cycle_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Demo posture: single-recruiter app, anon key in the browser. Enable RLS and
-- allow the anon role full read/write so the client works without auth. TIGHTEN
-- before any real deployment — add Supabase Auth and scope policies to a
-- recruiter's own cycles.
-- ---------------------------------------------------------------------------
alter table cycles       enable row level security;
alter table startups     enable row level security;
alter table screening_qs enable row level security;
alter table applications enable row level security;
alter table matches      enable row level security;
alter table allocations  enable row level security;

do $$
declare t text;
begin
  foreach t in array array['cycles','startups','screening_qs','applications','matches','allocations']
  loop
    execute format('drop policy if exists "demo_all" on %I;', t);
    execute format('create policy "demo_all" on %I for all using (true) with check (true);', t);
  end loop;
end $$;
