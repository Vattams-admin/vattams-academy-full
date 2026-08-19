# VATTAMS Academy Phase 52 — Notifications

## Purpose
Create the notification center foundation for Students, Tutors and Tuition Admin.

## Notification types
- Announcements
- Classes
- Assignments
- Tests
- Results
- Certificates
- Payments
- Account
- System

## Added
- Notification model
- Sort helper
- Unread count
- Mark one as read
- Mark all as read
- Notification Center UI
- Action links
- Mobile-first presentation

## Production requirements
The final backend notification system must:
1. Authorize notifications by user/role.
2. Never allow one student to read another student's private notifications.
3. Preserve important audit/history records.
4. Handle duplicate delivery safely.
5. Support read/unread state server-side.
6. Use existing authentication and RLS.
7. Avoid exposing secrets in notification text.

## Data safety
Phase 52 does not create notification tables or modify Supabase automatically. Existing Tuition data and authentication remain untouched.
