# VATTAMS Academy Phase 20 — Progress + Results + Reports

## Student view

- Overall performance percentage
- Performance level
- Attendance percentage
- Assignment average
- Test average
- Course activity completion
- Recent result records

## Tutor/Admin view

- Student performance snapshots
- Course-level progress
- Attendance, assignment, test and completion metrics
- Refreshable progress calculation

## Calculation

The current release derives a practical overall score from available activity:
- Attendance: 25% when classroom attendance exists
- Reviewed assignments: 30% when reviewed submissions exist
- Completed objective tests: 45% when attempts exist

If a category has no activity yet, the weighting is normalized rather than penalizing the student for missing data.

Course completion currently reflects classroom attendance + assignment submission + test attempts. Future lesson/material completion can add directly to the same model.

## Security

- Student reports only expose the student's own data.
- Tutor/Admin report endpoints are authenticated.
- Progress is calculated server-side.
- Existing tuition data is preserved.
- No destructive migration.
