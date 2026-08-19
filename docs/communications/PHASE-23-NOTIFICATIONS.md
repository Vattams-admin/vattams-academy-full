# VATTAMS Academy Phase 23 — Notifications + Announcements

## Added

- Academy announcements
- Audience targeting: everyone, students, tutors, admins
- Priority levels: low, normal, high, urgent
- Draft → publish workflow
- User notification inbox
- Unread count
- Mark one as read
- Mark all as read
- Announcement fan-out
- Tutor/Admin direct notification API
- Student/Tutor/Admin notification center
- Announcement display component

## Safety

- Existing generic notifications infrastructure is preserved.
- This phase adds Academy-specific communication tables.
- Notifications do not block the main app if loading fails.
- Existing Tuition data is not deleted or rewritten.
