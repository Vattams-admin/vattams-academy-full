# VATTAMS Academy Phase 24 — Admin Dashboard + Analytics

## Admin overview

The analytics layer provides:
- Total students
- Active students
- Total tutors
- Approved tutors
- Courses
- Enrollments
- Competitions
- Issued certificates
- Unread Academy notifications

## Daily analytics

Tracks:
- Classes
- Completed classes
- Attendance percentage
- Assignment submissions
- Test attempts
- Competitions created
- Certificates issued
- Notifications sent

The dashboard displays up to 30 days.

## Admin activity

A small audit trail records administrative analytics refresh actions. Future admin mutations can use the same table without changing the schema.

## Safety

- Admin-only reporting endpoints
- Aggregated reporting rather than exposing raw student data
- No destructive database changes
- Existing Tuition, Competition, Certificate and Notification data preserved
