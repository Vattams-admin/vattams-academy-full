-- VATTAMS Academy Phase 10
-- Student learning progress and analytics.
-- Additive only; no existing Tuition rows are deleted or altered.

create table if not exists public.tuition_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  lesson_id uuid not null references public.tuition_course_lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  last_opened_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, lesson_id)
);

create table if not exists public.tuition_learning_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  course_id uuid references public.tuition_courses(id) on delete cascade,
  lessons_total integer not null default 0,
  lessons_completed integer not null default 0,
  assignments_total integer not null default 0,
  assignments_submitted integer not null default 0,
  tests_total integer not null default 0,
  tests_attempted integer not null default 0,
  attendance_total integer not null default 0,
  attendance_present integer not null default 0,
  average_test_percentage numeric not null default 0,
  progress_percentage numeric not null default 0,
  updated_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create table if not exists public.tuition_progress_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  course_id uuid references public.tuition_courses(id) on delete set null,
  event_type text not null,
  reference_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_lesson_progress_student
  on public.tuition_lesson_progress(student_id);

create index if not exists idx_tuition_learning_progress_student
  on public.tuition_learning_progress(student_id);

create index if not exists idx_tuition_progress_events_student
  on public.tuition_progress_events(student_id);

alter table public.tuition_lesson_progress enable row level security;
alter table public.tuition_learning_progress enable row level security;
alter table public.tuition_progress_events enable row level security;

-- Access is enforced by the Academy Edge Function/session layer.
-- No permissive anonymous policies are created.
