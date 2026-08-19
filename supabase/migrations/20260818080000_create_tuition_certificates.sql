-- VATTAMS Academy Phase 11: certificates and public QR verification.
-- Additive only. Existing Tuition data is preserved.

create table if not exists public.tuition_certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_number text not null unique,
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  course_id uuid references public.tuition_courses(id) on delete set null,
  student_name text not null,
  course_name text not null,
  issued_on date not null default current_date,
  completion_percentage numeric not null default 100,
  certificate_type text not null default 'Course Completion',
  verification_status text not null default 'valid'
    check (verification_status in ('valid','revoked')),
  qr_token text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tuition_certificates_student
  on public.tuition_certificates(student_id);

create index if not exists idx_tuition_certificates_course
  on public.tuition_certificates(course_id);

create index if not exists idx_tuition_certificates_number
  on public.tuition_certificates(certificate_number);

alter table public.tuition_certificates enable row level security;

-- Public verification is handled through the certificate Edge Function.
-- No anonymous direct-table policy is created.
