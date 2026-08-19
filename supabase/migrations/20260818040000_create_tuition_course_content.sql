-- VATTAMS Academy Phase 7: scalable Course -> Level -> Module -> Lesson structure.
-- Additive only. Existing tuition courses/materials/tutor/student data are preserved.

CREATE TABLE IF NOT EXISTS tuition_course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_slug text NOT NULL REFERENCES tuition_courses(slug) ON DELETE CASCADE,
  level_name text,
  title text NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tuition_course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES tuition_course_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content text,
  duration_minutes integer,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tuition_course_modules_course ON tuition_course_modules(course_slug, display_order);
CREATE INDEX IF NOT EXISTS idx_tuition_course_lessons_module ON tuition_course_lessons(module_id, display_order);

ALTER TABLE tuition_course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tuition_course_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_published_tuition_modules" ON tuition_course_modules;
CREATE POLICY "public_select_published_tuition_modules" ON tuition_course_modules
  FOR SELECT TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "public_select_published_tuition_lessons" ON tuition_course_lessons;
CREATE POLICY "public_select_published_tuition_lessons" ON tuition_course_lessons
  FOR SELECT TO anon, authenticated USING (is_published = true);

CREATE OR REPLACE FUNCTION update_tuition_course_modules_updated_at()
RETURNS trigger AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS tuition_course_modules_updated_at ON tuition_course_modules;
CREATE TRIGGER tuition_course_modules_updated_at BEFORE UPDATE ON tuition_course_modules
FOR EACH ROW EXECUTE FUNCTION update_tuition_course_modules_updated_at();

CREATE OR REPLACE FUNCTION update_tuition_course_lessons_updated_at()
RETURNS trigger AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS tuition_course_lessons_updated_at ON tuition_course_lessons;
CREATE TRIGGER tuition_course_lessons_updated_at BEFORE UPDATE ON tuition_course_lessons
FOR EACH ROW EXECUTE FUNCTION update_tuition_course_lessons_updated_at();
