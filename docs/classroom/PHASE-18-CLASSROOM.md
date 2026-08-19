# VATTAMS Academy Phase 18 — Classroom & Attendance

## Core rule

Only students with an **active enrollment** can access a protected classroom session.

## Classroom flow

1. Active enrollment exists.
2. Tutor/Admin schedules a class.
3. Student sees the scheduled class.
4. Student/tutor joins through an authenticated classroom endpoint.
5. Meeting URL is returned only after authorization.
6. Join timestamps are recorded.
7. Tutor/Admin completes the class.
8. Attendance is recorded.
9. Later phases can use attendance for progress, tutor payout and reports.

## Supported class types

- Live
- Recorded
- Trial
- Orientation

## Attendance

Student:
- pending
- present
- late
- absent
- excused

Tutor:
- pending
- present
- late
- absent
- excused

Approved teaching minutes are stored for future hourly tutor payout calculations.

## Meeting provider

The phase deliberately stores a meeting URL/provider instead of locking VATTAMS to a single video vendor.

This allows a later Google Meet/Zoom/Jitsi/other integration without changing the classroom data model.

## Security

- Meeting URL is never exposed to anonymous users.
- Student can only access their own enrolled class.
- Tutor can only manage their assigned class.
- Admin can manage all classroom sessions.
- Existing Tuition data is preserved.
- No destructive migration.
