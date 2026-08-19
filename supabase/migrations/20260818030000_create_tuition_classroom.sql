create table if not exists public.tuition_classes (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  course_name text not null,
  subject text not null,
  class_grade text not null,
  board text,
  tutor_id uuid not null references public.tuition_tutors(id) on delete restrict,
  date date not null,
  start_time time not null,
  end_time time not null,
  mode text not null default 'online' check (mode in ('online','offline','hybrid')),
  meeting_provider text check (meeting_provider in ('zoom','google-meet','jitsi','other')),
  meeting_url text,
  status text not null default 'scheduled' check (status in ('scheduled','live','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tuition_class_students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.tuition_classes(id) on delete cascade,
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(class_id, student_id)
);

create table if not exists public.tuition_attendance (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.tuition_classes(id) on delete cascade,
  student_id uuid not null references public.tuition_students(id) on delete cascade,
  status text not null default 'not-marked' check (status in ('present','absent','late','not-marked')),
  notes text,
  marked_at timestamptz,
  marked_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(class_id, student_id)
);

create index if not exists idx_tuition_classes_tutor_date on public.tuition_classes(tutor_id, date);
create index if not exists idx_tuition_class_students_student on public.tuition_class_students(student_id);
create index if not exists idx_tuition_attendance_student on public.tuition_attendance(student_id);

alter table public.tuition_classes enable row level security;
alter table public.tuition_class_students enable row level security;
alter table public.tuition_attendance enable row level security;

-- Custom session authentication is enforced by the tuition-classroom Edge Function.
-- No public table access is granted through the anon role.
revoke all on public.tuition_classes from anon, authenticated;
revoke all on public.tuition_class_students from anon, authenticated;
revoke all on public.tuition_attendance from anon, authenticated;

create or replace function public.tuition_classroom_touch_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tuition_classes_updated_at on public.tuition_classes;
create trigger tuition_classes_updated_at before update on public.tuition_classes
for each row execute function public.tuition_classroom_touch_updated_at();

drop trigger if exists tuition_attendance_updated_at on public.tuition_attendance;
create trigger tuition_attendance_updated_at before update on public.tuition_attendance
for each row execute function public.tuition_classroom_touch_updated_at();
