/*
  VATTAMS Academy Phase 8 — protected material administration.
  No existing Tuition data is deleted or changed.
  Admin writes are performed only by the tuition-material-admin Edge Function
  after validating the existing admin_sessions record.

  The existing public SELECT policy remains the only browser table-read policy;
  unpublished materials remain invisible to public/Student clients.
*/

-- Ensure the material table has useful indexes for the admin catalogue.
CREATE INDEX IF NOT EXISTS idx_tuition_course_materials_created_at
  ON tuition_course_materials(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tuition_course_materials_course_slug_created_at
  ON tuition_course_materials(course_slug, created_at DESC);
