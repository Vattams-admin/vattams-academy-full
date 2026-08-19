# VATTAMS Academy Phase 40 — Release Candidate

## Release identity
- Product: VATTAMS Academy
- Tagline: Learn. Practice. Achieve.
- Release candidate: 1.0.0-rc.40
- Development complete target: September 2, 2026
- Testing: September 3–4, 2026
- Launch target: September 5, 2026

## What Phase 40 does
Phase 40 is final integration hardening around the existing Academy application. It adds:
- Release metadata
- Release Candidate dashboard component
- Final release checklist
- Client-side error reporting hooks
- Global browser error/unhandled-rejection capture utility

## What Phase 40 does NOT do
- Does not deploy production
- Does not publish the site
- Does not delete Home Services database tables
- Does not delete or migrate existing Tuition data
- Does not replace authentication
- Does not replace payment/UTR logic
- Does not expose service-role credentials
- Does not automatically mark production as ready

## September 2 — Development complete
Freeze feature development after the agreed scope is complete.

## September 3–4 — Testing only
No feature expansion. Test:
1. Student registration/login/logout
2. Tutor registration/payment/UTR/approval/login
3. Admin login and all admin operations
4. Course/enrollment/trial/classroom/materials
5. Assignments/tests/attendance/progress
6. Competitions/results
7. Certificates/QR verification
8. Notifications/announcements
9. Reports
10. Wi-Fi + mobile data + slow network + reconnect
11. Android PWA installation
12. Security/RLS/role authorization
13. Backup availability
14. Payment flows
15. Real-device UI and accessibility

## September 5 — Launch
Only after all critical tests pass:
1. Confirm production Supabase project.
2. Confirm managed backup.
3. Confirm Edge Functions.
4. Confirm production environment variables.
5. Run production build.
6. Deploy the approved release candidate.
7. Open the production URL.
8. Run post-deployment Student/Tutor/Admin smoke tests.
9. Monitor browser/server errors.
10. Keep rollback/recovery procedure ready.

## Release decision
A failed critical login, authorization, payment, data-integrity, certificate, or server-function test is a NO-GO.
