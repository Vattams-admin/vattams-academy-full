-- VATTAMS Academy Phase 13: in-app notification centre.
-- Additive only. Existing Tuition data is preserved.

create table if not exists public.tuition_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_role text not null
    check (recipient_role in ('student','tutor','admin')),
  recipient_id uuid,
  title text not null,
  message text not null,
  notification_type text not null default 'general',
  reference_type text,
  reference_id uuid,
  action_url text,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_notifications_recipient
  on public.tuition_notifications(recipient_role, recipient_id, created_at desc);

create index if not exists idx_tuition_notifications_unread
  on public.tuition_notifications(recipient_role, recipient_id, is_read);

alter table public.tuition_notifications enable row level security;

-- Notifications are accessed through the authenticated Academy session Edge Function.
-- No permissive anonymous direct-table policies are created.
