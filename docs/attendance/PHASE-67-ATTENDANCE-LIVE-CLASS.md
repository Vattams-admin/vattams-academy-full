# VATTAMS Academy Phase 67 — Attendance + Live Class Management

## Purpose
Create the live-class scheduling/join and attendance foundation.

## Live class lifecycle
Scheduled → Live → Completed
             ↘ Cancelled

## Features
- Upcoming class presentation
- Join window (15 minutes before start)
- Live classroom URL foundation
- Student check-in foundation
- Attendance history
- Present / absent / late / excused / pending
- Attendance percentage calculation

## Production security
1. Meeting URLs must be authorized server-side.
2. Students may join only classes they are enrolled/authorized for.
3. Attendance cannot be trusted from a simple client button.
4. Server should validate class membership and session timing.
5. Tutor/admin attendance changes must be audited.
6. Attendance records must be protected with RLS.
7. Prevent one student from editing another student's attendance.

## Data safety
No destructive database changes.
Existing Tuition students, tutors, selections, authentication, payments and approvals remain preserved.
