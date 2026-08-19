-- VATTAMS Academy Phase 17
-- Enrollment and access-control ledger.
-- Additive only: existing tuition_students/tutors/courses/payment data is preserved.

create table if not exists public.tuition_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.tuition_students(id) on delete set null,
  course_id uuid references public.tuition_courses(id) on delete set null,
  payment_id uuid references public.tuition_payments(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending','active','paused','completed','cancelled','expired')),
  access_start_at timestamptz,
  access_end_at timestamptz,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_tuition_enrollment_active_unique
  on public.tuition_enrollments(student_id, course_id)
  where status in ('pending','active','paused');

create index if not exists idx_tuition_enrollments_student
  on public.tuition_enrollments(student_id, created_at desc);

create index if not exists idx_tuition_enrollments_course
  on public.tuition_enrollments(course_id, created_at desc);

create index if not exists idx_tuition_enrollments_status
  on public.tuition_enrollments(status, created_at desc);

alter table public.tuition_enrollments enable row level security;

-- Payment-to-enrollment audit records.
create table if not exists public.tuition_payment_access_events (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.tuition_payments(id) on delete set null,
  enrollment_id uuid references public.tuition_enrollments(id) on delete set null,
  event_type text not null
    check (event_type in ('payment_verified','access_granted','access_revoked','payment_rejected','manual_override')),
  actor_id uuid,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_payment_access_events_payment
  on public.tuition_payment_access_events(payment_id, created_at desc);

alter table public.tuition_payment_access_events enable row level security;
