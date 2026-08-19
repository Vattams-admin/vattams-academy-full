-- VATTAMS Academy Phase 22
-- Professional Certificates + Unique Certificate Number + QR Verification
-- Additive only. Existing tuition/competition data is preserved.

create table if not exists public.tuition_certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_number text not null unique,
  verification_code text not null unique,
  student_id uuid references public.tuition_students(id) on delete set null,
  course_id uuid references public.tuition_courses(id) on delete set null,
  competition_id uuid references public.tuition_competitions(id) on delete set null,
  certificate_type text not null
    check (certificate_type in ('course','competition','achievement')),
  title text not null,
  recipient_name text not null,
  course_name text,
  category text,
  score numeric(10,2),
  percentage numeric(6,2),
  grade text,
  issued_at timestamptz not null default now(),
  issued_by uuid,
  status text not null default 'issued'
    check (status in ('issued','revoked')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoke_reason text
);

create index if not exists idx_tuition_certificates_student
  on public.tuition_certificates(student_id, issued_at desc);

create index if not exists idx_tuition_certificates_course
  on public.tuition_certificates(course_id, issued_at desc);

create index if not exists idx_tuition_certificates_verification
  on public.tuition_certificates(verification_code);

alter table public.tuition_certificates enable row level security;

-- Public verification is intentionally exposed only through the Edge Function.
-- Direct table policies are not opened here.

create or replace function public.generate_tuition_certificate_number()
returns text
language plpgsql
as $$
declare
  candidate text;
begin
  loop
    candidate := 'VATTAMS-' ||
      to_char(current_date, 'YYYY') || '-' ||
      upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 10));
    exit when not exists (
      select 1 from public.tuition_certificates
      where certificate_number = candidate
    );
  end loop;
  return candidate;
end;
$$;

create or replace function public.generate_tuition_verification_code()
returns text
language plpgsql
as $$
declare
  candidate text;
begin
  loop
    candidate := upper(substr(encode(gen_random_bytes(10), 'hex'), 1, 16));
    exit when not exists (
      select 1 from public.tuition_certificates
      where verification_code = candidate
    );
  end loop;
  return candidate;
end;
$$;
