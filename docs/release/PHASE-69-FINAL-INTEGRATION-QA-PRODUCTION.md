# VATTAMS Academy Phase 69 — Final Integration, QA & Production Release

## Purpose
Close the 69-phase implementation with a controlled release gate.

## Final QA areas

### 1. Authentication
- Student login
- Tutor login
- Admin login
- Invalid credentials
- Session persistence
- Logout
- Password reset through existing auth flow
- Wi-Fi login
- Mobile data login
- Wi-Fi ↔ mobile-data switching
- Temporary network interruption recovery

### 2. Authorization
- Student cannot access tutor/admin routes
- Tutor cannot access admin routes
- Admin access remains protected
- RLS is tested with direct unauthorized queries

### 3. Tuition preservation
- Existing `tuition_students` rows remain
- Existing `tuition_tutors` rows remain
- Historical selections remain
- Existing tutor fee/approval logic remains
- Existing Home Services functionality remains
- Historical "Spoken English" database values remain unchanged
- Public/display naming can be "Public Speaking" without rewriting historical values

### 4. Payments
- Fee display
- Payment submission
- UTR/reference
- Admin verification
- Duplicate submission protection
- Rejected/refund handling
- Payment history

### 5. Tutor settlement
- Approved teaching sessions
- Hourly calculation
- Settlement approval
- Paid status
- Auditability

### 6. Academy
- Profiles
- Courses
- Live classes
- Attendance
- Competitions
- Leaderboard
- Certificates
- QR verification
- Notifications

### 7. Production
- Build
- Type check
- HTTPS
- Environment variables
- Domain
- Database backup
- Staging smoke test
- Real Android browser/device test

## Release gate
The release should not be declared production-ready while required real-environment checks remain warnings or failures.

## Rollback
Before any production schema migration:
1. Create a database backup.
2. Record the migration.
3. Apply the smallest safe change.
4. Run smoke tests.
5. Roll back if authentication, RLS, payment or historical data integrity fails.

## Data safety
Phase 69 adds QA/release tooling and documentation only. It does not delete, recreate or silently migrate existing production records.
