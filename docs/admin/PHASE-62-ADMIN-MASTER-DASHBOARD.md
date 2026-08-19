# VATTAMS Academy Phase 62 — Admin Master Dashboard & Reports

## Purpose
Create the central operational dashboard for Academy administration.

## Dashboard areas
- Students
- Active students
- Tutors
- Tutor approvals
- Courses
- Upcoming classes
- Payment verification
- Assignment grading review
- Attendance review
- Tutor settlements

## Reports
The dashboard provides a report-row foundation for operational counts. Production reports must consume server-authorized data.

## Security
1. Admin access must be authenticated.
2. Admin role must be enforced server-side/RLS.
3. Financial reports must use verified payment records.
4. Tutor settlement reports must use approved teaching sessions.
5. Student reports must not expose unnecessary personal data.
6. Audit-sensitive actions should be logged.

## Data safety
No destructive database changes.
No existing profiles, students, tutors, payments or historical tuition records are deleted or recreated.
Existing authentication/RLS remains the source of truth.
