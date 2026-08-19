-- VATTAMS Academy Phase 23
-- Notifications + Announcements + User Inbox
-- Additive only. Existing notifications table is not modified.

create table if not exists public.tuition_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  audience text not null default 'all'
    check (audience in ('all','students','tutors','admins','course')),
  course_id uuid references public.tuition_courses(id) on delete set null,
  priority text not null default 'normal'
    check (priority in ('low','normal','high','urgent')),
  publish_at timestamptz not null default now(),
  expires_at timestamptz,
  status text not null default 'draft'
    check (status in ('draft','published','expired','cancelled')),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tuition_announcements_publish
  on public.tuition_announcements(status, publish_at desc);

create table if not exists public.tuition_user_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null,
  recipient_role text not null
    check (recipient_role in ('student','tutor','admin')),
  title text not null,
  message text not null,
  notification_type text not null default 'general'
    check (notification_type in (
      'general','class','assignment','test','competition',
      'certificate','payment','approval','announcement','system'
    )),
  action_url text,
  reference_id uuid,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_tuition_user_notifications_recipient
  on public.tuition_user_notifications(recipient_id, created_at desc);

create index if not exists idx_tuition_user_notifications_unread
  on public.tuition_user_notifications(recipient_id, is_read, created_at desc);

alter table public.tuition_announcements enable row level security;
alter table public.tuition_user_notifications enable row level security;

-- Communication access remains behind the authenticated Edge Function.
-- Existing generic notifications infrastructure is preserved.
