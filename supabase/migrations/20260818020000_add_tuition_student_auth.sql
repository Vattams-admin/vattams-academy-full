-- VATTAMS Academy student authentication. Additive only.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.tuition_student_auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL UNIQUE REFERENCES public.tuition_students(id) ON DELETE CASCADE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tuition_student_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.tuition_students(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tuition_student_sessions_student_id ON public.tuition_student_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_tuition_student_sessions_expires_at ON public.tuition_student_sessions(expires_at);

ALTER TABLE public.tuition_student_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tuition_student_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "no_public_tuition_student_auth" ON public.tuition_student_auth;
DROP POLICY IF EXISTS "no_public_tuition_student_sessions" ON public.tuition_student_sessions;

CREATE OR REPLACE FUNCTION public.update_tuition_student_auth_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tuition_student_auth_updated_at ON public.tuition_student_auth;
CREATE TRIGGER trg_tuition_student_auth_updated_at
BEFORE UPDATE ON public.tuition_student_auth
FOR EACH ROW EXECUTE FUNCTION public.update_tuition_student_auth_updated_at();
