-- VATTAMS Academy Phase 28
-- Certificate Verification + QR foundation
-- Additive only. Existing certificate records are preserved.

create table if not exists public.tuition_certificate_verifications (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid not null references public.tuition_certificates(id) on delete cascade,
  certificate_number text not null unique,
  verification_code text not null unique,
  status text not null default 'active'
    check (status in ('active','revoked')),
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tuition_certificate_verifications_number
  on public.tuition_certificate_verifications(certificate_number);

create index if not exists idx_tuition_certificate_verifications_code
  on public.tuition_certificate_verifications(verification_code);

alter table public.tuition_certificate_verifications enable row level security;

-- Public verification is intentionally served through the Edge Function.
-- No direct public table policy is opened.
