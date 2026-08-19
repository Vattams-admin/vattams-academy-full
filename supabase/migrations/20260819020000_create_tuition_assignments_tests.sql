-- VATTAMS Academy Phase 30
-- Assignments + Tests
-- Additive only. Existing Tuition data is preserved.

create table if not exists public.tuition_assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.tuition_courses(id) on delete set null,
  classroom_session_id uuid references public.tuition_classroom_sessions(id) on delete set null,
  tutor_id uuid references public.tuition_tutors(id) on delete set null,
  title text not null,
  description text,
  instructions text,
  due_at timestamptz,
  max_score numeric(8,2) not null default 100,
  status text not null default 'draft'
    check (status in ('draft','published','closed')),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tuition_assignments_course
  on public.tuition_assignments(course_id, created_at desc);

create index if not exists idx_tuition_assignments_tutor
  on public.tuition_assignments(tutor_id, created_at desc);

create table if not exists public.tuition_assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.tuition_assignments(id) on delete cascade,
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  submission_text text,
  submission_url text,
  score numeric(8,2),
  feedback text,
  status text not null default 'submitted'
    check (status in ('draft','submitted','reviewed','returned')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  updated_at timestamptz not null default now(),
  unique(assignment_id, student_id)
);

create index if not exists idx_tuition_assignment_submissions_student
  on public.tuition_assignment_submissions(student_id, submitted_at desc);

create table if not exists public.tuition_tests (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.tuition_courses(id) on delete set null,
  tutor_id uuid references public.tuition_tutors(id) on delete set null,
  title text not null,
  description text,
  duration_minutes integer not null default 30,
  max_attempts integer not null default 1,
  pass_percentage numeric(6,2) not null default 40,
  status text not null default 'draft'
    check (status in ('draft','published','closed')),
  is_published boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tuition_tests_course
  on public.tuition_tests(course_id, created_at desc);

create table if not exists public.tuition_test_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tuition_tests(id) on delete cascade,
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

create index if not exists idx_tuition_test_questions_test
  on public.tuition_test_questions(test_id, question_order);

create table if not exists public.tuition_test_attempts (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tuition_tests(id) on delete cascade,
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  attempt_number integer not null default 1,
  answers jsonb not null default '{}'::jsonb,
  score numeric(8,2) not null default 0,
  percentage numeric(6,2) not null default 0,
  status text not null default 'in_progress'
    check (status in ('in_progress','submitted','passed','failed')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  unique(test_id, student_id, attempt_number)
);

create index if not exists idx_tuition_test_attempts_student
  on public.tuition_test_attempts(student_id, created_at desc);

create table if not exists public.tuition_test_results (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique references public.tuition_test_attempts(id) on delete cascade,
  test_id uuid not null references public.tuition_tests(id) on delete cascade,
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  score numeric(8,2) not null default 0,
  percentage numeric(6,2) not null default 0,
  result_status text not null default 'failed'
    check (result_status in ('passed','failed')),
  published_at timestamptz not null default now()
);

create index if not exists idx_tuition_test_results_student
  on public.tuition_test_results(student_id, published_at desc);

alter table public.tuition_assignments enable row level security;
alter table public.tuition_assignment_submissions enable row level security;
alter table public.tuition_tests enable row level security;
alter table public.tuition_test_questions enable row level security;
alter table public.tuition_test_attempts enable row level security;
alter table public.tuition_test_results enable row level security;

-- All access is handled by the authenticated Edge Function.
-- No direct public policies are opened.
