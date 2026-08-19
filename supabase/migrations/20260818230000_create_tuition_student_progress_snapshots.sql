-- VATTAMS Academy Phase 26
-- Student Progress & Learning Analytics
-- Additive reporting/snapshot layer. Existing transactional data is not changed.

create table if not exists public.tuition_student_progress_snapshots (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  snapshot_date date not null,
  classes_total integer not null default 0,
  classes_completed integer not null default 0,
  attendance_percentage numeric(6,2) not null default 0,
  assignments_submitted integer not null default 0,
  tests_attempted integer not null default 0,
  tests_passed integer not null default 0,
  average_test_percentage numeric(6,2) not null default 0,
  competitions_attempted integer not null default 0,
  certificates_issued integer not null default 0,
  progress_percentage numeric(6,2) not null default 0,
  updated_at timestamptz not null default now(),
  unique(student_id, snapshot_date)
);

create index if not exists idx_tuition_student_progress_student_date
  on public.tuition_student_progress_snapshots(student_id, snapshot_date desc);

alter table public.tuition_student_progress_snapshots enable row level security;

-- Progress is served through the authenticated Edge Function.
-- No direct public read policy is opened.
