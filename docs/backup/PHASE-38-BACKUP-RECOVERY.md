# VATTAMS Academy Phase 38 — Backup & Recovery Readiness

## Added
- Backup-readiness inventory
- Academy data-scope manifest
- Recovery checklist
- Admin Backup & Recovery dashboard
- Backup manifest audit record

## Protected data scope
The readiness inventory covers the Academy application domains:
- Students
- Tutors
- Courses
- Course levels
- Materials
- Trial requests
- Classroom
- Attendance
- Assignments
- Tests
- Competitions
- Certificates
- Notifications
- Announcements
- Reports

## Important limitation
This phase intentionally does **not** generate or expose a database dump through the browser.

Actual database backups must use the approved managed Supabase backup/export process. The new dashboard only verifies readiness, inventories important tables, and records a manifest.

## Recovery principle
Never restore directly over production without first validating the restore in a controlled environment.

## Critical preservation requirements
- Existing tuition_students rows must remain intact.
- Existing tuition_tutors rows must remain intact.
- Historical selections and IDs must remain intact.
- Existing tutor fee/approval logic must remain intact.
- Existing student/tutor authentication must remain intact.
