# VATTAMS Academy Phase 48 — Assessment Engine Foundation

## Purpose
Create the foundation for Tests, Exams and Competition assessments.

## Supported question types
- Single choice
- Multiple choice
- True / False
- Short answer

## Assessment controls
- Duration
- Pass percentage
- Attempts allowed
- Marks
- Negative marks
- Required questions
- Question ordering
- Draft/review status

## Validation
- Assessment ID
- Title
- Existing Course ID
- Positive duration
- Valid pass percentage
- Valid attempt count
- At least one question
- Unique question IDs
- Valid question prompts
- Valid marks

## Scoring
A reusable scoring utility is included for objective/short-answer questions.

## Data safety
Phase 48 does not create or modify Supabase assessment tables. It intentionally avoids guessing the existing schema.

Before wiring this into production:
1. Inspect existing tuition class/test/assessment tables and RPCs.
2. Reuse existing tables where appropriate.
3. Preserve historical records.
4. Add migrations only after schema review.
5. Apply RLS policies before enabling student submissions.
