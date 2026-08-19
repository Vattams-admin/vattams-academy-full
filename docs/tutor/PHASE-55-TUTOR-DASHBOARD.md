# VATTAMS Academy Phase 55 — Tutor Dashboard

## Purpose
Create the central Tutor Portal dashboard while preserving existing tutor registration, payment/UTR, verification, approval and historical tuition data.

## Dashboard areas
- Assigned students
- Active courses
- Upcoming classes
- Pending assignments
- Attendance review
- Notifications/attention items
- Classroom
- Students
- Assignments
- Attendance
- Courses

## Tutor workflow
Registration → Payment/UTR → Admin Verification → Approval → Tutor Dashboard → Courses → Students → Classroom → Materials → Attendance → Assignments → Tests → Progress

## Production security
Tutor authorization must be derived from the existing authenticated role and server-side RLS. A tutor must never access another tutor's students, private records or payment information.

## Data safety
No destructive database changes were made.
No tutor records were deleted or recreated.
Existing tuition tutor approval and ID assignment logic remains the source of truth.
