-- VATTAMS Academy Phase 33
-- Reports + Analytics
-- Additive only. Existing Tuition data is preserved.

create table if not exists public.tuition_report_snapshots (
  id uuid primary key default gen_random_uuid(),
  report_type text not null
    check (report_type in (
      'student_progress','tutor_performance','course_performance',
      'attendance','assignments','tests','competitions',
      'certificates','revenue'
    )),
  period_start date,
  period_end date,
  generated_by uuid,
  parameters jsonb not null default '{}'::jsonb,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_report_snapshots_type
  on public.tuition_report_snapshots(report_type, created_at desc);

create index if not exists idx_tuition_report_snapshots_period
  on public.tuition_report_snapshots(period_start, period_end);

alter table public.tuition_report_snapshots enable row level security;

-- Report generation and access are handled by the authenticated Edge Function.
-- No direct public policies are opened.
