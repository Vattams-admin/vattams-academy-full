# VATTAMS Academy Phase 56 — Student Dashboard & Course Enrollment

## Purpose
Create the central Student Portal and student-side course enrollment foundation.

## Dashboard areas
- Active courses
- Completed courses
- Upcoming classes
- Pending assignments
- Pending tests
- Attendance
- Course progress
- Classroom
- Results
- Course search and enrollment

## Enrollment safety
The UI can create a local enrollment-request state for demonstration. Production enrollment must:
1. Use the authenticated student identity server-side.
2. Validate the course against the approved catalogue.
3. Respect existing Tuition enrollment/payment/approval rules.
4. Prevent duplicate enrollment.
5. Apply RLS so students can access only their own enrollment records.
6. Preserve historical enrollment records.

## Important
Existing `tuition_students` data and historical selections must remain intact. Do not replace existing enrollment logic without schema and workflow review.
