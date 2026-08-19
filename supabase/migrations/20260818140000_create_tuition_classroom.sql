-- VATTAMS Academy Phase 18
-- Classroom scheduling and attendance foundation.
-- Additive only: existing tuition class/attendance tables are not altered or deleted.

create table if not exists public.tuition_class_sessions (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid references public.tuition_enrollments(id) on delete set null,
  course_id uuid references public.tuition_courses(id) on delete set null,
  student_id uuid references public.tuition_students(id) on delete set null,
  tutor_id uuid references public.tuition_tutors(id) on delete set null,
  title text not null,
  description text,
  class_type text not null default 'live'
    check (class_type in ('live','recorded','trial','orientation')),
  scheduled_start_at timestamptz not null,
  scheduled_end_at timestamptz not null,
  meeting_url text,
  meeting_provider text,
  status text not null default 'scheduled'
    check (status in ('scheduled','live','completed','cancelled','no_show')),
  tutor_joined_at timestamptz,
  student_joined_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (scheduled_end_at > scheduled_start_at)
);

create index if not exists idx_tuition_class_sessions_student
  on public.tuition_class_sessions(student_id, scheduled_start_at desc);

create index if not exists idx_tuition_class_sessions_tutor
  on public.tuition_class_sessions(tutor_id, scheduled_start_at desc);

create index if not exists idx_tuition_class_sessions_course
  on public.tuition_class_sessions(course_id, scheduled_start_at desc);

create index if not exists idx_tuition_class_sessions_status_time
  on public.tuition_class_sessions(status, scheduled_start_at);

alter table public.tuition_class_sessions enable row level security;

create table if not exists public.tuition_class_attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.tuition_class_sessions(id) on delete cascade,
  student_id uuid references public.tuition_students(id) on delete set null,
  tutor_id uuid references public.tuition_tutors(id) on delete set null,
  student_status text not null default 'pending'
    check (student_status in ('pending','present','late','absent','excused')),
  tutor_status text not null default 'pending'
    check (tutor_status in ('pending','present','late','absent','excused')),
  student_joined_at timestamptz,
  student_left_at timestamptz,
  tutor_joined_at timestamptz,
  tutor_left_at timestamptz,
  minutes_attended integer not null default 0 check (minutes_attended >= 0),
  notes text,
  marked_by uuid,
  marked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_tuition_class_attendance_session_student
  on public.tuition_class_attendance(session_id, student_id);

create index if not exists idx_tuition_class_attendance_student
  on public.tuition_class_attendance(student_id, created_at desc);

alter table public.tuition_class_attendance enable row level security;

-- Never expose a meeting URL publicly.
-- Meeting URLs are returned only through the authenticated classroom function.
