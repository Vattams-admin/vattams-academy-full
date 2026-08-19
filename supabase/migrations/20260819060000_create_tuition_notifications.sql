-- VATTAMS Academy Phase 34
-- Notifications + Announcements
-- Additive only. Existing Tuition data is preserved.

create table if not exists public.tuition_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_role text not null
    check (recipient_role in ('student','tutor','admin','all')),
  recipient_id uuid,
  notification_type text not null default 'general'
    check (notification_type in (
      'general','announcement','class','assignment','test',
      'competition','certificate','attendance','payment','system'
    )),
  title text not null,
  message text not null,
  action_page text,
  action_id text,
  priority text not null default 'normal'
    check (priority in ('low','normal','high','urgent')),
  is_read boolean not null default false,
  read_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_notifications_recipient
  on public.tuition_notifications(recipient_role, recipient_id, created_at desc);

create index if not exists idx_tuition_notifications_unread
  on public.tuition_notifications(recipient_role, recipient_id, is_read, created_at desc);

create index if not exists idx_tuition_notifications_expiry
  on public.tuition_notifications(expires_at);

create table if not exists public.tuition_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  audience text not null default 'all'
    check (audience in ('all','students','tutors','admins')),
  priority text not null default 'normal'
    check (priority in ('normal','high','urgent')),
  publish_at timestamptz not null default now(),
  expires_at timestamptz,
  status text not null default 'draft'
    check (status in ('draft','published','expired','cancelled')),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tuition_announcements_schedule
  on public.tuition_announcements(status, publish_at, expires_at);

create table if not exists public.tuition_notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_role text not null
    check (user_role in ('student','tutor','admin')),
  user_id uuid not null,
  in_app_enabled boolean not null default true,
  class_enabled boolean not null default true,
  assignment_enabled boolean not null default true,
  test_enabled boolean not null default true,
  competition_enabled boolean not null default true,
  certificate_enabled boolean not null default true,
  attendance_enabled boolean not null default true,
  payment_enabled boolean not null default true,
  announcement_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  unique(user_role, user_id)
);

create index if not exists idx_tuition_notification_preferences_user
  on public.tuition_notification_preferences(user_role, user_id);

alter table public.tuition_notifications enable row level security;
alter table public.tuition_announcements enable row level security;
alter table public.tuition_notification_preferences enable row level security;

-- Direct client access remains closed.
-- Notification authorization and delivery are handled by the Edge Function.
