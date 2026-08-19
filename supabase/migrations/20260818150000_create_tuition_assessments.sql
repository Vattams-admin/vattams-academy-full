-- VATTAMS Academy Phase 19
-- Assignments + Tests + Online Assessment Engine
-- Additive only. Existing tuition tables/data are preserved.

create table if not exists public.tuition_assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.tuition_courses(id) on delete set null,
  title text not null,
  description text,
  instructions text,
  due_at timestamptz,
  max_score numeric(8,2) not null default 100,
  status text not null default 'draft'
    check (status in ('draft','published','closed')),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tuition_assignments_course
  on public.tuition_assignments(course_id, created_at desc);

alter table public.tuition_assignments enable row level security;

create table if not exists public.tuition_assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references public.tuition_assignments(id) on delete cascade,
  student_id uuid references public.tuition_students(id) on delete set null,
  submission_text text,
  file_url text,
  submitted_at timestamptz not null default now(),
  score numeric(8,2),
  tutor_feedback text,
  status text not null default 'submitted'
    check (status in ('submitted','reviewed','returned','late')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_tuition_assignment_submission_student
  on public.tuition_assignment_submissions(assignment_id, student_id);

create index if not exists idx_tuition_assignment_submissions_student
  on public.tuition_assignment_submissions(student_id, submitted_at desc);

alter table public.tuition_assignment_submissions enable row level security;

create table if not exists public.tuition_tests (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.tuition_courses(id) on delete set null,
  title text not null,
  description text,
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  max_attempts integer not null default 1 check (max_attempts > 0),
  pass_percentage numeric(5,2) not null default 40 check (pass_percentage between 0 and 100),
  status text not null default 'draft'
    check (status in ('draft','published','closed')),
  shuffle_questions boolean not null default true,
  show_result_immediately boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tuition_tests_course
  on public.tuition_tests(course_id, created_at desc);

alter table public.tuition_tests enable row level security;

create table if not exists public.tuition_test_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references public.tuition_tests(id) on delete cascade,
  question_text text not null,
  question_type text not null default 'mcq'
    check (question_type in ('mcq','true_false','short_answer')),
  options jsonb,
  correct_answer text,
  marks numeric(8,2) not null default 1 check (marks >= 0),
  sort_order integer not null default 0,
  explanation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tuition_test_questions_test
  on public.tuition_test_questions(test_id, sort_order);

alter table public.tuition_test_questions enable row level security;

create table if not exists public.tuition_test_attempts (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references public.tuition_tests(id) on delete cascade,
  student_id uuid references public.tuition_students(id) on delete set null,
  attempt_number integer not null default 1,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score numeric(8,2) not null default 0,
  max_score numeric(8,2) not null default 0,
  percentage numeric(5,2) not null default 0,
  passed boolean not null default false,
  status text not null default 'in_progress'
    check (status in ('in_progress','submitted','auto_graded','reviewed','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tuition_test_attempts_student
  on public.tuition_test_attempts(student_id, created_at desc);

create unique index if not exists idx_tuition_test_attempts_number
  on public.tuition_test_attempts(test_id, student_id, attempt_number);

alter table public.tuition_test_attempts enable row level security;

create table if not exists public.tuition_test_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.tuition_test_attempts(id) on delete cascade,
  question_id uuid references public.tuition_test_questions(id) on delete cascade,
  answer_text text,
  awarded_marks numeric(8,2) not null default 0,
  is_correct boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_tuition_test_answers_attempt_question
  on public.tuition_test_answers(attempt_id, question_id);

alter table public.tuition_test_answers enable row level security;

create index if not exists idx_tuition_test_answers_attempt
  on public.tuition_test_answers(attempt_id);

-- No RLS policy is weakened here. The authenticated Edge Function remains
-- the controlled access layer for these tables.
