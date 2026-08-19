-- VATTAMS Academy Phase 16: configurable student fees and tutor payout rules.
-- Additive only. Existing course/tutor/payment data is preserved.

create table if not exists public.tuition_fee_structures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  level text,
  delivery_mode text not null default 'one_to_one'
    check (delivery_mode in ('one_to_one','group','package')),
  duration_minutes integer not null default 60,
  sessions_per_package integer,
  student_fee numeric(12,2) not null check (student_fee >= 0),
  currency text not null default 'INR',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tuition_tutor_payout_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tutor_tier text not null,
  payout_model text not null default 'revenue_share'
    check (payout_model in ('revenue_share','fixed_session')),
  tutor_percentage numeric(5,2),
  fixed_session_amount numeric(12,2),
  min_session_amount numeric(12,2),
  max_session_amount numeric(12,2),
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (payout_model = 'revenue_share'
      and tutor_percentage is not null
      and tutor_percentage >= 0
      and tutor_percentage <= 100)
    or
    (payout_model = 'fixed_session'
      and fixed_session_amount is not null
      and fixed_session_amount >= 0)
  )
);

create table if not exists public.tuition_tutor_joining_fee_settings (
  id uuid primary key default gen_random_uuid(),
  fee_amount numeric(12,2) not null default 499 check (fee_amount >= 0),
  currency text not null default 'INR',
  fee_name text not null default 'Tutor Registration & Verification Fee',
  description text,
  refund_policy text,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists idx_tuition_fee_structures_active
  on public.tuition_fee_structures(is_active, category, delivery_mode);

create index if not exists idx_tuition_tutor_payout_active
  on public.tuition_tutor_payout_rules(is_active, tutor_tier);

alter table public.tuition_fee_structures enable row level security;
alter table public.tuition_tutor_payout_rules enable row level security;
alter table public.tuition_tutor_joining_fee_settings enable row level security;

-- Seed launch defaults. These are recommendations and can be changed by Admin.
insert into public.tuition_fee_structures
(name, category, level, delivery_mode, duration_minutes, student_fee, sort_order)
values
('Primary Online 1-to-1', 'Academic', 'Class 1–5', 'one_to_one', 60, 299, 10),
('Middle School Online 1-to-1', 'Academic', 'Class 6–8', 'one_to_one', 60, 399, 20),
('Secondary Online 1-to-1', 'Academic', 'Class 9–10', 'one_to_one', 60, 499, 30),
('Senior Secondary Online 1-to-1', 'Academic', 'Class 11–12', 'one_to_one', 60, 599, 40),
('Foundation Online 1-to-1', 'Foundation', null, 'one_to_one', 60, 499, 50),
('Competitive Foundation Online 1-to-1', 'Competitive', null, 'one_to_one', 60, 699, 60),
('JEE NEET Foundation Online 1-to-1', 'Competitive', null, 'one_to_one', 60, 799, 70),
('Coding Online 1-to-1', 'Technology', null, 'one_to_one', 60, 699, 80),
('AI Data Science Online 1-to-1', 'Technology', null, 'one_to_one', 60, 999, 90),
('International English Online 1-to-1', 'International', null, 'one_to_one', 60, 799, 100),
('Public Speaking Online 1-to-1', 'Communication', null, 'one_to_one', 60, 599, 110),
('Primary Group Batch', 'Academic', 'Class 1–5', 'group', 60, 999, 210),
('Middle School Group Batch', 'Academic', 'Class 6–8', 'group', 60, 1299, 220),
('Secondary Group Batch', 'Academic', 'Class 9–10', 'group', 60, 1599, 230),
('Senior Secondary Group Batch', 'Academic', 'Class 11–12', 'group', 60, 1999, 240),
('Vedic Maths Group Batch', 'Foundation', null, 'group', 60, 999, 250),
('Spoken English Group Batch', 'Communication', null, 'group', 60, 999, 260),
('Coding Group Batch', 'Technology', null, 'group', 60, 1499, 270)
on conflict do nothing;

insert into public.tuition_tutor_payout_rules
(name, tutor_tier, payout_model, tutor_percentage, fixed_session_amount, min_session_amount, max_session_amount, category)
values
('Primary Tutor', 'primary', 'fixed_session', null, 200, 200, 200, 'Academic'),
('Middle School Tutor', 'middle', 'fixed_session', null, 250, 250, 250, 'Academic'),
('Secondary Tutor', 'secondary', 'fixed_session', null, 300, 300, 300, 'Academic'),
('Senior Secondary Tutor', 'senior_secondary', 'fixed_session', null, 350, 350, 350, 'Academic'),
('Foundation Tutor', 'foundation', 'fixed_session', null, 350, 350, 350, 'Foundation'),
('Competitive Foundation Tutor', 'competitive_foundation', 'fixed_session', null, 400, 400, 400, 'Competitive'),
('JEE NEET Foundation Tutor', 'jee_neet_foundation', 'fixed_session', null, 500, 500, 500, 'Competitive'),
('Coding Tutor', 'coding', 'fixed_session', null, 450, 450, 450, 'Technology'),
('AI Data Science Tutor', 'ai_data_science', 'fixed_session', null, 600, 600, 600, 'Technology'),
('International English Tutor', 'international_english', 'fixed_session', null, 450, 450, 450, 'International'),
('Public Speaking Tutor', 'public_speaking', 'fixed_session', null, 350, 350, 350, 'Communication'),
('Specialist Tutor', 'specialist', 'fixed_session', null, 600, 500, 800, 'Specialist')
on conflict do nothing;

insert into public.tuition_tutor_joining_fee_settings
(fee_amount, currency, fee_name, description, refund_policy)
select
  499,
  'INR',
  'Tutor Registration & Verification Fee',
  'One-time application processing and profile verification fee. It does not guarantee approval, students, employment or income.',
  'Publish the final refund/cancellation policy before collecting the fee.'
where not exists (
  select 1 from public.tuition_tutor_joining_fee_settings where is_active = true
);
