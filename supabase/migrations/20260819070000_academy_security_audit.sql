-- VATTAMS Academy Phase 35
-- Security/audit foundation. Additive only.
-- Existing authentication and historical data are preserved.

create table if not exists public.tuition_security_events (
  id uuid primary key default gen_random_uuid(),
  actor_role text,
  actor_id uuid,
  event_type text not null,
  success boolean not null default true,
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_security_events_actor
  on public.tuition_security_events(actor_role, actor_id, created_at desc);

create index if not exists idx_tuition_security_events_type
  on public.tuition_security_events(event_type, success, created_at desc);

create table if not exists public.tuition_login_attempts (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('student','tutor','admin')),
  identifier_hash text not null,
  success boolean not null default false,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_login_attempts_identifier
  on public.tuition_login_attempts(identifier_hash, created_at desc);

create index if not exists idx_tuition_login_attempts_created
  on public.tuition_login_attempts(created_at desc);

alter table public.tuition_security_events enable row level security;
alter table public.tuition_login_attempts enable row level security;

-- Direct client access stays closed.
-- Authentication functions/services should write security events using
-- the service role or a controlled server-side path.
