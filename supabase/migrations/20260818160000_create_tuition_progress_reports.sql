-- VATTAMS Academy Phase 20
-- Student Progress + Results + Performance Reports
-- Additive only. Existing tuition data and business logic are preserved.

create table if not exists public.tuition_progress_snapshots (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.tuition_students(id) on delete cascade,
  course_id uuid references public.tuition_courses(id) on delete set null,
  enrollment_id uuid references public.tuition_enrollments(id) on delete set null,
  attendance_percentage numeric(5,2) not null default 0,
  classes_attended integer not null default 0,
  classes_total integer not null default 0,
  assignments_submitted integer not null default 0,
  assignments_total integer not null default 0,
  assignment_average numeric(6,2) not null default 0,
  tests_attempted integer not null default 0,
  tests_passed integer not null default 0,
  test_average numeric(6,2) not null default 0,
  course_completion_percentage numeric(5,2) not null default 0,
  overall_percentage numeric(5,2) not null default 0,
  performance_level text not null default 'Needs Improvement'
    check (performance_level in ('Outstanding','Excellent','Good','Needs Improvement')),
  snapshot_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_progress_student_course
  on public.tuition_progress_snapshots(student_id, course_id, snapshot_at desc);

alter table public.tuition_progress_snapshots enable row level security;

create table if not exists public.tuition_result_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.tuition_students(id) on delete set null,
  course_id uuid references public.tuition_courses(id) on delete set null,
  enrollment_id uuid references public.tuition_enrollments(id) on delete set null,
  result_type text not null
    check (result_type in ('assignment','test','class','course')),
  source_id uuid,
  title text not null,
  score numeric(8,2),
  max_score numeric(8,2),
  percentage numeric(6,2),
  grade text,
  passed boolean,
  result_date timestamptz not null default now(),
  remarks text,
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_result_records_student
  on public.tuition_result_records(student_id, result_date desc);

create index if not exists idx_tuition_result_records_course
  on public.tuition_result_records(course_id, result_date desc);

alter table public.tuition_result_records enable row level security;

create table if not exists public.tuition_course_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.tuition_students(id) on delete cascade,
  course_id uuid references public.tuition_courses(id) on delete cascade,
  enrollment_id uuid references public.tuition_enrollments(id) on delete set null,
  completed_modules integer not null default 0,
  total_modules integer not null default 0,
  completed_lessons integer not null default 0,
  total_lessons integer not null default 0,
  completed_materials integer not null default 0,
  total_materials integer not null default 0,
  completion_percentage numeric(5,2) not null default 0,
  last_activity_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(student_id, course_id)
);

create index if not exists idx_tuition_course_progress_student
  on public.tuition_course_progress(student_id, updated_at desc);

alter table public.tuition_course_progress enable row level security;

-- These tables are written/read through the authenticated progress function.
-- Existing RLS policies are not replaced or weakened by this migration.
