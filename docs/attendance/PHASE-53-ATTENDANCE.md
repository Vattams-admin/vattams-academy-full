# VATTAMS Academy Phase 53 — Attendance

## Purpose
Create the attendance foundation for Students, Tutors and Tuition Admin.

## Statuses
- Present
- Absent
- Late
- Excused

## Added
- Attendance record model
- Attendance summary calculation
- Percentage calculation
- Attendance Center UI
- Tutor/Admin marking foundation
- Student read-only security guidance

## Production rules
1. Attendance changes require authenticated tutor/admin authorization.
2. Students can view only their own attendance.
3. Historical attendance should remain immutable unless an approved correction workflow exists.
4. Attendance used for certificates/progress must come from server-validated records.
5. RLS must restrict records by student/course/tutor/admin scope.

## Data safety
Phase 53 does not create or modify Supabase tables automatically. Existing Tuition data remains untouched.
