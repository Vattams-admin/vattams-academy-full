# VATTAMS Academy — Phase 69 Final Release Guide

The 69 planned phases are now represented in the project release chain.

## Before production
1. Install dependencies.
2. Run type/build checks.
3. Configure production environment variables.
4. Verify Supabase/auth configuration.
5. Test student/tutor/admin login.
6. Test Wi-Fi and mobile data.
7. Test network switching.
8. Verify RLS and authorization.
9. Verify payments and duplicate protection.
10. Verify historical Tuition data.
11. Run staging smoke tests.
12. Back up the production database.
13. Deploy.
14. Run post-deployment smoke tests.

## Important
The ZIP does not claim that live production backend integration has been automatically verified. The final gate intentionally remains `production_ready: false` until the real environment is tested.
