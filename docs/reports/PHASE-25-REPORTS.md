# VATTAMS Academy Phase 25 — Reports & Export Center

## Reports

Admin can generate:
- Academy Overview
- Daily Activity
- Certificates
- Announcements
- Notifications

## Date filters

Reports support a start and end date where applicable.

## CSV export

Exports are generated server-side and downloaded by the admin browser.

Each export is logged with:
- admin/requester
- report type
- date range
- row count
- status
- timestamp

## Safety

- Admin-only access
- No direct public database reporting
- Existing transactional data is read, not rewritten
- No destructive database changes
- CSV exports do not expose private verification secrets such as certificate verification codes
