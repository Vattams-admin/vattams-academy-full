# VATTAMS Academy — Phase 14 Launch Matrix

## Release dates

- Development target: **September 2, 2026**
- Testing only: **September 3–4, 2026**
- Launch target: **September 5, 2026**

## Critical rule

Do not use the launch date as a substitute for testing. A failed critical check blocks production release.

## Network matrix

Every authentication and network-dependent flow must be tested on:

1. Home Wi-Fi
2. Mobile data
3. A different Wi-Fi

Critical flows:

- Student login
- Tutor login
- Admin login
- Student registration
- Tutor registration
- Dashboard loading
- Course loading
- Classroom
- Materials
- Attendance
- Assignment
- Test
- Competition
- Certificate verification
- Notifications
- Logout

## Role matrix

### Student

- Login/logout
- Profile
- Courses
- Enrollment
- Trial
- Classroom
- Materials
- Assignments
- Tests
- Attendance
- Progress
- Competitions
- Results
- Certificates
- Notifications

### Tutor

- Registration
- Payment/UTR
- Approval status
- Login/logout
- Dashboard
- Course/student access
- Trial classes
- Classroom
- Materials
- Attendance
- Assignments
- Tests
- Progress
- Competitions
- Notifications

### Admin

- Login/logout
- Tutor approval
- Student management
- Payment verification
- Course management
- Materials
- Trial management
- Classroom
- Attendance
- Assignments/tests
- Competitions
- Results
- Certificates
- QR verification
- Notifications
- Reports

## Security release gates

- No service-role key in frontend
- No new public database write policy
- Existing RLS remains enabled
- Role boundaries tested
- Expired sessions rejected
- Logout invalidates the applicable session
- Public certificate verification exposes only intended certificate fields
- Production HTTPS enabled
- No Home Services navigation/entry points remain in the final Academy UI
- No historical Tuition data deleted

## Final release gate

Only release after all critical checks pass on all three networks.
