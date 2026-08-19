-- VATTAMS Academy tutor authentication. Additive only.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
ALTER TABLE public.tuition_tutors ADD COLUMN IF NOT EXISTS password_hash text;
CREATE TABLE IF NOT EXISTS public.tuition_tutor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES public.tuition_tutors(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tuition_tutor_sessions_tutor_id ON public.tuition_tutor_sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tuition_tutor_sessions_expires_at ON public.tuition_tutor_sessions(expires_at);
ALTER TABLE public.tuition_tutor_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "no_public_tutor_sessions_select" ON public.tuition_tutor_sessions;
DROP POLICY IF EXISTS "no_public_tutor_sessions_insert" ON public.tuition_tutor_sessions;
DROP POLICY IF EXISTS "no_public_tutor_sessions_update" ON public.tuition_tutor_sessions;
DROP POLICY IF EXISTS "no_public_tutor_sessions_delete" ON public.tuition_tutor_sessions;
CREATE OR REPLACE FUNCTION public.hash_tuition_tutor_password() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.password_hash IS NOT NULL AND NEW.password_hash <> ''
     AND NEW.password_hash NOT LIKE '$2a$%' AND NEW.password_hash NOT LIKE '$2b$%' AND NEW.password_hash NOT LIKE '$2y$%' THEN
    NEW.password_hash := crypt(NEW.password_hash, gen_salt('bf', 10));
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_hash_tuition_tutor_password ON public.tuition_tutors;
CREATE TRIGGER trg_hash_tuition_tutor_password BEFORE INSERT OR UPDATE OF password_hash ON public.tuition_tutors FOR EACH ROW EXECUTE FUNCTION public.hash_tuition_tutor_password();
