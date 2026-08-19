-- VATTAMS Academy Phase 12: competitions, registrations, attempts and leaderboards.
-- Additive only. Existing Tuition data is preserved.

create table if not exists public.tuition_competitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  course_id uuid references public.tuition_courses(id) on delete set null,
  question_bank_id uuid references public.tuition_question_banks(id) on delete set null,
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  max_attempts integer not null default 1 check (max_attempts > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  is_published boolean not null default false,
  certificate_enabled boolean not null default false,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tuition_competition_registrations (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.tuition_competitions(id) on delete cascade,
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  registered_at timestamptz not null default now(),
  status text not null default 'registered'
    check (status in ('registered','cancelled','completed')),
  unique (competition_id, student_id)
);

create table if not exists public.tuition_competition_attempts (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.tuition_competitions(id) on delete cascade,
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score numeric not null default 0,
  total_marks numeric not null default 0,
  percentage numeric not null default 0,
  rank integer,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_competitions_category
  on public.tuition_competitions(category);

create index if not exists idx_tuition_competition_reg_student
  on public.tuition_competition_registrations(student_id);

create index if not exists idx_tuition_competition_attempt_student
  on public.tuition_competition_attempts(student_id);

create index if not exists idx_tuition_competition_attempt_rank
  on public.tuition_competition_attempts(competition_id, rank);

alter table public.tuition_competitions enable row level security;
alter table public.tuition_competition_registrations enable row level security;
alter table public.tuition_competition_attempts enable row level security;

-- Role/session checks are performed by the Edge Function.
-- No permissive anonymous direct-table policies are created.
