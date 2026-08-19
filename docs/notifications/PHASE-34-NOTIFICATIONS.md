# VATTAMS Academy Phase 34 — Notifications & Announcements

## Notification system
- In-app notifications for Students, Tutors and Admins
- Direct notifications
- Broadcast notifications
- Notification categories:
  - Class
  - Assignment
  - Test
  - Competition
  - Certificate
  - Attendance
  - Payment
  - System
- Priority:
  - Normal
  - High
  - Urgent
- Read/unread state
- Mark one as read
- Mark all as read
- Expiry support

## Announcements
- Academy-wide announcements
- Student-only announcements
- Tutor-only announcements
- Admin announcements
- Scheduled publish time
- Optional expiry
- Priority
- Draft / Published / Expired / Cancelled foundation

## Preferences
Users can control in-app notification categories.

## Security
All notification operations are authenticated through the Academy notification Edge Function. Direct table access remains closed by RLS.

This phase does not change existing authentication, Tuition logic, Home Services tables, payment schema, or historical data.
