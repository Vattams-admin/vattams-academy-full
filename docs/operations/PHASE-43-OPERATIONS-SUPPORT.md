# VATTAMS Academy Phase 43 — Operations & Support

## Purpose
Provide a structured way for Students, Tutors and Admin staff to prepare technical/support reports after launch.

## Added
- Support categories
- Priority levels
- Support draft persistence during the browser session
- Support reference generation
- Basic diagnostic context
- Privacy warning
- Support Center component

## Support categories
- Login / Account
- Course / Enrollment
- Classroom
- Assignment
- Test / Exam
- Competition
- Certificate / QR
- Payment / UTR
- Notification
- Technical Issue
- Other

## Important
Phase 43 does not automatically send the support report to an external service. It prepares a structured report and reference in the current browser session.

If a production ticketing system is introduced later, it should be connected through a server-side authenticated path.

## Never collect in support text
- Passwords
- OTPs
- Supabase service-role keys
- Payment secrets
- Full card numbers
- Private API credentials

## Incident priority
Urgent issues should be reserved for:
- Authentication unavailable for many users
- Data-integrity concerns
- Unauthorized access/security incidents
- Payment data/security incidents
- Production-wide outage
