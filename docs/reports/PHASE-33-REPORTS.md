# VATTAMS Academy Phase 33 — Reports & Analytics

## Admin reports
- Academy dashboard totals
- Student progress
- Tutor performance
- Course activity
- Attendance analytics
- Assignment and test analytics
- Competition analytics
- Certificate analytics
- Date-range filtering

## Design
- Reports are generated server-side through an authenticated admin Edge Function.
- Existing tables are read without destructive migrations.
- Report snapshots provide a future audit/history layer.
- No student private profile information is exposed to public users.

## Note
Revenue/payment analytics are reserved for the existing payment/fee data model and should be connected only after its exact schema is verified. No payment schema was changed in Phase 33.
