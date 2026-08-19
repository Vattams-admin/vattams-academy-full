-- VATTAMS Academy Phase 15: student/course payment records.
-- IMPORTANT: Existing tutor registration fee/UTR/approval logic is preserved.
-- This migration adds a separate payment ledger for Academy course/enrollment fees.

create table if not exists public.tuition_payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.tuition_students(id) on delete set null,
  course_id uuid references public.tuition_courses(id) on delete set null,
  enrollment_id uuid,
  payment_type text not null default 'course_fee'
    check (payment_type in ('course_fee','enrollment_fee','trial_fee','exam_fee','competition_fee','certificate_fee','other')),
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'INR',
  payment_method text not null default 'upi'
    check (payment_method in ('upi','bank_transfer','cash','card','gateway','other')),
  transaction_reference text,
  utr_number text,
  proof_url text,
  status text not null default 'pending'
    check (status in ('pending','submitted','verified','rejected','refunded','cancelled')),
  notes text,
  verified_by uuid,
  verified_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tuition_payments_student
  on public.tuition_payments(student_id, created_at desc);

create index if not exists idx_tuition_payments_course
  on public.tuition_payments(course_id, created_at desc);

create index if not exists idx_tuition_payments_status
  on public.tuition_payments(status, created_at desc);

create unique index if not exists idx_tuition_payments_utr_unique
  on public.tuition_payments(utr_number)
  where utr_number is not null and length(trim(utr_number)) > 0;

alter table public.tuition_payments enable row level security;

-- Payment access is handled through the authenticated Academy payment function.
-- No permissive anonymous payment policies are created.

-- A small, non-sensitive Academy payment configuration table.
create table if not exists public.tuition_payment_settings (
  id uuid primary key default gen_random_uuid(),
  display_name text not null default 'VATTAMS Academy',
  upi_id text,
  account_name text,
  bank_name text,
  account_number_last4 text,
  ifsc text,
  payment_instructions text,
  support_message text,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.tuition_payment_settings enable row level security;
