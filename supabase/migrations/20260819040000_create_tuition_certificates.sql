-- VATTAMS Academy Phase 32
-- Professional Certificates + Public QR Verification
-- Additive only. Existing Tuition data is preserved.

create table if not exists public.tuition_certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_number text not null unique,
  student_id uuid not null references public.tuition_students(id) on delete restrict,
  course_id uuid references public.tuition_courses(id) on delete set null,
  competition_id uuid references public.tuition_competitions(id) on delete set null,
  certificate_type text not null default 'course'
    check (certificate_type in ('course','competition','achievement','completion')),
  title text not null,
  description text,
  issue_date date not null default current_date,
  completion_date date,
  score numeric(10,2),
  percentage numeric(7,2),
  grade text,
  issuer_name text not null default 'VATTAMS Academy',
  status text not null default 'issued'
    check (status in ('draft','issued','revoked')),
  verification_token text not null unique,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tuition_certificates_student
  on public.tuition_certificates(student_id, issue_date desc);

create index if not exists idx_tuition_certificates_course
  on public.tuition_certificates(course_id, issue_date desc);

create index if not exists idx_tuition_certificates_competition
  on public.tuition_certificates(competition_id, issue_date desc);

create table if not exists public.tuition_certificate_events (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid not null references public.tuition_certificates(id) on delete cascade,
  event_type text not null
    check (event_type in ('issued','viewed','downloaded','verified','revoked')),
  verifier_ip text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_certificate_events_certificate
  on public.tuition_certificate_events(certificate_id, created_at desc);

alter table public.tuition_certificates enable row level security;
alter table public.tuition_certificate_events enable row level security;

-- Certificate access is handled through authenticated service functions.
-- Public verification does not expose private student information.
