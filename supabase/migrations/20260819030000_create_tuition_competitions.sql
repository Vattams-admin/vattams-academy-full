-- VATTAMS Academy Phase 31
-- Competitions + Leaderboards + Results
-- Additive only. Existing Tuition data is preserved.

create table if not exists public.tuition_competitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  course_id uuid references public.tuition_courses(id) on delete set null,
  competition_type text not null default 'quiz'
    check (competition_type in ('quiz','mock_test','challenge','creative','speaking','coding')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  duration_minutes integer not null default 30,
  max_participants integer,
  entry_mode text not null default 'free'
    check (entry_mode in ('free','enrolled')),
  status text not null default 'draft'
    check (status in ('draft','published','live','completed','cancelled')),
  is_published boolean not null default false,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists idx_tuition_competitions_schedule
  on public.tuition_competitions(starts_at, ends_at);

create index if not exists idx_tuition_competitions_category
  on public.tuition_competitions(category, status);

create table if not exists public.tuition_competition_questions (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.tuition_competitions(id) on delete cascade,
  question_order integer not null default 1,
  question_text text not null,
  question_type text not null default 'mcq'
    check (question_type in ('mcq','true_false','short_answer')),
  options jsonb not null default '[]'::jsonb,
  correct_answer text,
  marks numeric(8,2) not null default 1,
  explanation text,
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_competition_questions
  on public.tuition_competition_questions(competition_id, question_order);

create table if not exists public.tuition_competition_entries (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.tuition_competitions(id) on delete cascade,
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  registered_at timestamptz not null default now(),
  status text not null default 'registered'
    check (status in ('registered','started','submitted','disqualified')),
  started_at timestamptz,
  submitted_at timestamptz,
  unique(competition_id, student_id)
);

create index if not exists idx_tuition_competition_entries_student
  on public.tuition_competition_entries(student_id, registered_at desc);

create table if not exists public.tuition_competition_attempts (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.tuition_competitions(id) on delete cascade,
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  entry_id uuid not null references public.tuition_competition_entries(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score numeric(10,2) not null default 0,
  percentage numeric(7,2) not null default 0,
  rank integer,
  status text not null default 'in_progress'
    check (status in ('in_progress','submitted','evaluated')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  unique(entry_id)
);

create index if not exists idx_tuition_competition_attempts_competition
  on public.tuition_competition_attempts(competition_id, score desc, submitted_at);

create index if not exists idx_tuition_competition_attempts_student
  on public.tuition_competition_attempts(student_id, created_at desc);

create table if not exists public.tuition_competition_results (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.tuition_competitions(id) on delete cascade,
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  attempt_id uuid not null unique references public.tuition_competition_attempts(id) on delete cascade,
  score numeric(10,2) not null default 0,
  percentage numeric(7,2) not null default 0,
  rank integer,
  award text,
  published_at timestamptz not null default now(),
  unique(competition_id, student_id)
);

create index if not exists idx_tuition_competition_results_rank
  on public.tuition_competition_results(competition_id, rank);

alter table public.tuition_competitions enable row level security;
alter table public.tuition_competition_questions enable row level security;
alter table public.tuition_competition_entries enable row level security;
alter table public.tuition_competition_attempts enable row level security;
alter table public.tuition_competition_results enable row level security;

-- Access is handled by the authenticated Edge Function.
-- No direct public policies are opened.
