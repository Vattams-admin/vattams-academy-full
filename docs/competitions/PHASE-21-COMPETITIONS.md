# VATTAMS Academy Phase 21 — Competitions + Leaderboards

## Competition categories

The engine supports:
- Mathematics
- Science
- GK
- English
- Tamil
- Spelling Bee
- Mental Maths
- Abacus
- Coding
- AI
- Public Speaking
- Essay
- Creative Writing
- Drawing
- Chess
- Logical Reasoning
- Competitive Exam Mock Tests

The category is stored as data, so more categories can be added without redesigning the engine.

## Contest flow

Admin/Tutor:
1. Create competition.
2. Set category, level, schedule, duration, participant limit and entry fee.
3. Add questions.
4. Open registration.

Student:
1. Register.
2. Enter during the allowed window.
3. Complete timed questions.
4. Submit.
5. Receive score.
6. View leaderboard.

## Ranking

Leaderboard ordering:
1. Higher score first.
2. Faster submission time as tie-breaker.

Top three receive display award labels:
- Champion
- Runner-up
- Second Runner-up

These are platform award labels, not external accreditation.

## Certificate readiness

Competitions include a certificate_enabled flag. Certificate issuance itself is intentionally a later phase so certificates can be generated only after final result validation.

## Security

- Student must be authenticated.
- Correct answers are never returned by the student start endpoint.
- Registration is enforced server-side.
- Competition timing is checked server-side.
- Duplicate registration/attempt is blocked.
- Existing Tuition data is preserved.
- No destructive database changes.
