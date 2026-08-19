-- VATTAMS Academy Phase 24
-- Admin Dashboard + Academy Analytics
-- Additive reporting tables only. Existing transactional tables are preserved.

create table if not exists public.tuition_analytics_daily (
  id uuid primary key default gen_random_uuid(),
  metric_date date not null,
  students_total integer not null default 0,
  students_active integer not null default 0,
  tutors_total integer not null default 0,
  tutors_approved integer not null default 0,
  courses_total integer not null default 0,
  enrollments_total integer not null default 0,
  classes_total integer not null default 0,
  classes_completed integer not null default 0,
  attendance_percentage numeric(6,2) not null default 0,
  assignments_submitted integer not null default 0,
  tests_attempted integer not null default 0,
  competitions_total integer not null default 0,
  certificates_issued integer not null default 0,
  notifications_sent integer not null default 0,
  updated_at timestamptz not null default now(),
  unique(metric_date)
);

create index if not exists idx_tuition_analytics_daily_date
  on public.tuition_analytics_daily(metric_date desc);

create table if not exists public.tuition_admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid,
  action text not null,
  entity_type text,
  entity_id uuid,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_admin_activity_log_created
  on public.tuition_admin_activity_log(created_at desc);

alter table public.tuition_analytics_daily enable row level security;
alter table public.tuition_admin_activity_log enable row level security;

-- Reports are served through the authenticated Edge Function.
-- No direct public read policy is added.
