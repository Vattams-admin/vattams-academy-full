# VATTAMS Academy Phase 13

In-app notification and communication centre.

Features:
- Student/Tutor/Admin notifications
- Unread count
- Mark one read
- Mark all read
- Announcement broadcast
- Notification type
- Reference ID/type
- Optional action URL
- Polling refresh every 60 seconds
- Notification failures do not break dashboards

Additive migration only. Existing Tuition data is preserved.

Future hardening before launch:
- connect automatic notification triggers to class creation, attendance, assignments, tests, competitions and certificates
- optional push notifications after a verified FCM/browser notification setup
- integrate NotificationCenter into the final shared Academy header
