-- VATTAMS Academy Phase 25
-- Reports + Export Center
-- Additive only. No existing transactional data is changed.

create table if not exists public.tuition_report_exports (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null,
  report_type text not null
    check (report_type in (
      'academy_overview',
      'daily_activity',
      'certificates',
      'announcements',
      'notifications'
    )),
  date_from date,
  date_to date,
  file_format text not null default 'csv'
    check (file_format in ('csv')),
  row_count integer not null default 0,
  status text not null default 'completed'
    check (status in ('completed','failed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_report_exports_requested
  on public.tuition_report_exports(requested_by, created_at desc);

alter table public.tuition_report_exports enable row level security;

-- Report data remains behind the authenticated Edge Function.
