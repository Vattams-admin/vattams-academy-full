# VATTAMS Academy Phase 37 — QA & Release Readiness

## Purpose
Phase 37 adds a lightweight health-check layer and a release checklist. It does not replace real end-to-end testing.

## Critical user journeys

### Student
- [ ] Registration
- [ ] Login on Wi-Fi
- [ ] Login on mobile data
- [ ] Logout
- [ ] Course browsing
- [ ] Enrollment
- [ ] Trial class
- [ ] Classroom
- [ ] Materials
- [ ] Assignment submission
- [ ] Test attempt/submission
- [ ] Attendance
- [ ] Progress
- [ ] Competition registration
- [ ] Competition result
- [ ] Certificate view
- [ ] Certificate verification
- [ ] Notifications

### Tutor
- [ ] Registration
- [ ] Joining-fee/payment/UTR workflow
- [ ] Admin approval
- [ ] Employee ID assignment
- [ ] Login on Wi-Fi
- [ ] Login on mobile data
- [ ] Dashboard
- [ ] Course/student access
- [ ] Classroom
- [ ] Materials
- [ ] Attendance
- [ ] Assignments
- [ ] Tests
- [ ] Competitions
- [ ] Notifications

### Admin
- [ ] Admin login
- [ ] Dashboard
- [ ] Student management
- [ ] Tutor management
- [ ] Payment verification
- [ ] Course management
- [ ] Materials
- [ ] Trial classes
- [ ] Classroom
- [ ] Attendance
- [ ] Tests
- [ ] Competitions
- [ ] Results
- [ ] Certificates
- [QR verification]
- [ ] Notifications
- [ ] Reports
- [ ] Security dashboard

## Network matrix
Test every login and critical submission on:
1. Home/office Wi-Fi
2. Mobile 4G/5G
3. Slow network
4. Network disconnect during page load
5. Reconnect after offline state
6. Different Android browser
7. Desktop browser

## Security checks
- [ ] No password appears in URL
- [ ] No service-role key in browser code
- [ ] Protected data is not publicly readable
- [ ] Expired session is rejected server-side
- [ ] Logout removes local session token
- [ ] Student cannot access Tutor/Admin protected actions
- [ ] Tutor cannot access Admin protected actions
- [ ] Admin-only operations reject non-admin sessions
- [ ] Certificate verification exposes only intended public data

## PWA checks
- [ ] Install prompt works where supported
- [ ] App opens in standalone mode
- [ ] Offline shell opens
- [ ] Authentication/API requests are not served from stale cache
- [ ] Reconnection restores normal requests

## Production release gate
Do not call the product production-ready until:
- Real Supabase environment is tested.
- Build passes in a network-enabled environment.
- Critical login journeys pass.
- RLS policies are reviewed.
- Edge Functions are deployed and tested.
- Payment flows are verified.
- Mobile and desktop smoke tests pass.
