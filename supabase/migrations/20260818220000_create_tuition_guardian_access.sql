-- VATTAMS Academy Phase 27
-- Parent/Guardian Access + Controlled Student Progress Sharing
-- Additive only. Existing student/tutor records are preserved.

create table if not exists public.tuition_guardians (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  guardian_name text not null,
  relationship text not null,
  email text,
  mobile text,
  status text not null default 'pending'
    check (status in ('pending','active','suspended','revoked')),
  access_code_hash text,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tuition_guardians_student
  on public.tuition_guardians(student_id);

create table if not exists public.tuition_guardian_sessions (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.tuition_guardians(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create index if not exists idx_tuition_guardian_sessions_expiry
  on public.tuition_guardian_sessions(expires_at);

create table if not exists public.tuition_guardian_shares (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.tuition_guardians(id) on delete cascade,
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  share_type text not null
    check (share_type in ('progress','attendance','certificates','results','all')),
  status text not null default 'active'
    check (status in ('active','revoked')),
  granted_by uuid,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists idx_tuition_guardian_shares_guardian
  on public.tuition_guardian_shares(guardian_id, status);

create table if not exists public.tuition_guardian_activity_log (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid references public.tuition_guardians(id) on delete set null,
  action text not null,
  student_id uuid references public.tuition_students(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_guardian_activity
  on public.tuition_guardian_activity_log(created_at desc);

alter table public.tuition_guardians enable row level security;
alter table public.tuition_guardian_sessions enable row level security;
alter table public.tuition_guardian_shares enable row level security;
alter table public.tuition_guardian_activity_log enable row level security;

-- All guardian access is served through the authenticated Edge Function.
-- No direct public table policies are opened.
