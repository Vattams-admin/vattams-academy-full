# VATTAMS Academy Phase 54 — Virtual Classroom

## Purpose
Build the online classroom foundation for Students and Tutors.

## Session lifecycle
Scheduled → Live → Completed
Cancelled is a separate terminal state.

## Added
- Classroom session model
- Session status calculation
- Upcoming/live/completed views
- Join-live state
- Classroom Center UI
- Meeting-link security guidance

## Production requirements
1. Meeting URLs must not be public.
2. Student access must be limited to enrolled/authorized sessions.
3. Tutor access must be limited to assigned sessions.
4. Admin access must follow the existing role model.
5. Attendance should be linked to server-validated classroom sessions.
6. Do not store meeting credentials in client code.
7. Use approved video provider integration only after security/privacy review.

## Data safety
Phase 54 does not replace existing Tuition booking or tutor logic and does not automatically create classroom tables.
