-- VATTAMS Academy Phase 9: Assignments, question bank and tests.
-- Additive migration only. Existing Tuition data is preserved.

create table if not exists public.tuition_assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.tuition_courses(id) on delete cascade,
  title text not null,
  description text,
  instructions text,
  due_at timestamptz,
  max_marks integer not null default 100 check (max_marks > 0),
  is_published boolean not null default false,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tuition_assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.tuition_assignments(id) on delete cascade,
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  answer_text text,
  attachment_url text,
  submitted_at timestamptz,
  marks numeric,
  feedback text,
  status text not null default 'pending'
    check (status in ('pending','submitted','graded','returned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

create table if not exists public.tuition_question_banks (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.tuition_courses(id) on delete cascade,
  title text not null,
  description text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.tuition_questions (
  id uuid primary key default gen_random_uuid(),
  question_bank_id uuid not null references public.tuition_question_banks(id) on delete cascade,
  question_text text not null,
  question_type text not null default 'mcq'
    check (question_type in ('mcq','true_false','short_answer')),
  options jsonb not null default '[]'::jsonb,
  correct_answer text,
  marks integer not null default 1 check (marks > 0),
  explanation text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tuition_tests (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.tuition_courses(id) on delete cascade,
  question_bank_id uuid references public.tuition_question_banks(id) on delete set null,
  title text not null,
  instructions text,
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  pass_percentage numeric not null default 40 check (pass_percentage >= 0 and pass_percentage <= 100),
  max_attempts integer not null default 1 check (max_attempts > 0),
  is_published boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tuition_test_attempts (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tuition_tests(id) on delete cascade,
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score numeric,
  percentage numeric,
  passed boolean,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_assignments_course
  on public.tuition_assignments(course_id);

create index if not exists idx_tuition_assignment_submissions_student
  on public.tuition_assignment_submissions(student_id);

create index if not exists idx_tuition_tests_course
  on public.tuition_tests(course_id);

create index if not exists idx_tuition_test_attempts_student
  on public.tuition_test_attempts(student_id);

alter table public.tuition_assignments enable row level security;
alter table public.tuition_assignment_submissions enable row level security;
alter table public.tuition_question_banks enable row level security;
alter table public.tuition_questions enable row level security;
alter table public.tuition_tests enable row level security;
alter table public.tuition_test_attempts enable row level security;

-- Backend Edge Functions enforce role/session access.
-- No permissive anonymous policies are added here.
