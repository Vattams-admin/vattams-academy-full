-- VATTAMS Academy Phase 29
-- Online Classroom + Secure Class Sessions
-- Additive only. Existing class/session data is preserved.

create table if not exists public.tuition_classroom_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.tuition_courses(id) on delete set null,
  tutor_id uuid references public.tuition_tutors(id) on delete set null,
  title text not null,
  description text,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  meeting_url text,
  meeting_provider text,
  access_mode text not null default 'link'
    check (access_mode in ('link','embedded','recording')),
  recording_url text,
  status text not null default 'scheduled'
    check (status in ('scheduled','live','completed','cancelled')),
  is_published boolean not null default false,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (scheduled_end > scheduled_start)
);

create index if not exists idx_tuition_classroom_sessions_start
  on public.tuition_classroom_sessions(scheduled_start);

create index if not exists idx_tuition_classroom_sessions_course
  on public.tuition_classroom_sessions(course_id, scheduled_start);

create index if not exists idx_tuition_classroom_sessions_tutor
  on public.tuition_classroom_sessions(tutor_id, scheduled_start);

create table if not exists public.tuition_classroom_session_access (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.tuition_classroom_sessions(id) on delete cascade,
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  access_status text not null default 'allowed'
    check (access_status in ('allowed','blocked','completed')),
  joined_at timestamptz,
  left_at timestamptz,
  created_at timestamptz not null default now(),
  unique(session_id, student_id)
);

create index if not exists idx_tuition_classroom_access_student
  on public.tuition_classroom_session_access(student_id, created_at desc);

create table if not exists public.tuition_classroom_resources (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.tuition_classroom_sessions(id) on delete cascade,
  title text not null,
  resource_type text not null
    check (resource_type in ('material','link','recording','assignment','other')),
  resource_url text,
  description text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_classroom_resources_session
  on public.tuition_classroom_resources(session_id, created_at desc);

create table if not exists public.tuition_classroom_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.tuition_classroom_sessions(id) on delete cascade,
  student_id uuid references public.tuition_students(id) on delete set null,
  tutor_id uuid references public.tuition_tutors(id) on delete set null,
  event_type text not null
    check (event_type in ('opened','joined','left','resource_opened','recording_opened')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_classroom_events_session
  on public.tuition_classroom_events(session_id, created_at desc);

alter table public.tuition_classroom_sessions enable row level security;
alter table public.tuition_classroom_session_access enable row level security;
alter table public.tuition_classroom_resources enable row level security;
alter table public.tuition_classroom_events enable row level security;

-- Access is handled by the authenticated Edge Function.
-- No direct public policies are opened.
