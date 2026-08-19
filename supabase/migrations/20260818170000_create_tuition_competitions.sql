-- VATTAMS Academy Phase 21
-- Competitions + Leaderboards + Contest Engine
-- Additive only. Existing tuition data is preserved.

create table if not exists public.tuition_competitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  description text,
  category text not null,
  level text not null default 'all',
  rules text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  registration_closes_at timestamptz,
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  max_participants integer check (max_participants is null or max_participants > 0),
  entry_fee numeric(10,2) not null default 0 check (entry_fee >= 0),
  status text not null default 'draft'
    check (status in ('draft','registration_open','live','completed','cancelled')),
  certificate_enabled boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists idx_tuition_competitions_status_time
  on public.tuition_competitions(status, starts_at);

create table if not exists public.tuition_competition_questions (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references public.tuition_competitions(id) on delete cascade,
  question_text text not null,
  question_type text not null default 'mcq'
    check (question_type in ('mcq','true_false','short_answer')),
  options jsonb,
  correct_answer text,
  marks numeric(8,2) not null default 1 check (marks >= 0),
  sort_order integer not null default 0,
  explanation text,
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_competition_questions
  on public.tuition_competition_questions(competition_id, sort_order);

create table if not exists public.tuition_competition_registrations (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references public.tuition_competitions(id) on delete cascade,
  student_id uuid references public.tuition_students(id) on delete cascade,
  registered_at timestamptz not null default now(),
  status text not null default 'registered'
    check (status in ('registered','started','submitted','disqualified','cancelled')),
  unique(competition_id, student_id)
);

create index if not exists idx_tuition_competition_registrations_student
  on public.tuition_competition_registrations(student_id, registered_at desc);

create table if not exists public.tuition_competition_attempts (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references public.tuition_competitions(id) on delete cascade,
  registration_id uuid references public.tuition_competition_registrations(id) on delete cascade,
  student_id uuid references public.tuition_students(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score numeric(10,2) not null default 0,
  max_score numeric(10,2) not null default 0,
  percentage numeric(6,2) not null default 0,
  rank integer,
  status text not null default 'in_progress'
    check (status in ('in_progress','submitted','auto_graded','disqualified','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_tuition_competition_attempt_one
  on public.tuition_competition_attempts(competition_id, student_id);

create index if not exists idx_tuition_competition_attempts_score
  on public.tuition_competition_attempts(competition_id, score desc, submitted_at asc);

create table if not exists public.tuition_competition_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.tuition_competition_attempts(id) on delete cascade,
  question_id uuid references public.tuition_competition_questions(id) on delete cascade,
  answer_text text,
  awarded_marks numeric(8,2) not null default 0,
  is_correct boolean,
  created_at timestamptz not null default now(),
  unique(attempt_id, question_id)
);

create table if not exists public.tuition_competition_leaderboard (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid references public.tuition_competitions(id) on delete cascade,
  student_id uuid references public.tuition_students(id) on delete cascade,
  rank integer not null,
  score numeric(10,2) not null default 0,
  percentage numeric(6,2) not null default 0,
  time_taken_seconds integer,
  award_title text,
  created_at timestamptz not null default now(),
  unique(competition_id, student_id)
);

create index if not exists idx_tuition_competition_leaderboard_rank
  on public.tuition_competition_leaderboard(competition_id, rank);

alter table public.tuition_competitions enable row level security;
alter table public.tuition_competition_questions enable row level security;
alter table public.tuition_competition_registrations enable row level security;
alter table public.tuition_competition_attempts enable row level security;
alter table public.tuition_competition_answers enable row level security;
alter table public.tuition_competition_leaderboard enable row level security;

-- Access remains controlled by the authenticated Edge Function.
-- Correct answers are never returned by the student-facing start endpoint.
