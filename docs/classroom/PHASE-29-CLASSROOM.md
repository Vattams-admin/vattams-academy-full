# VATTAMS Academy Phase 29 — Online Classroom

## Student

Students can:
- View published classes
- Open class details
- Join a scheduled class
- Open class resources
- Open recordings when available

## Tutor

Tutors can:
- Create class sessions
- Schedule start/end time
- Add meeting provider and URL
- Publish class sessions
- Add learning resources
- Add recording/resource links

## Admin

Admin has a classroom session listing endpoint for management/reporting foundation.

## Security

- Student can only access explicitly assigned classroom sessions.
- Tutor can only modify sessions they own.
- Admin-only session listing.
- Meeting URLs are returned only after authenticated authorization.
- Existing tuition class/attendance data is not deleted or rewritten.
- This phase does not force a specific meeting provider. Google Meet, Zoom, Teams, or another approved provider can be used.
