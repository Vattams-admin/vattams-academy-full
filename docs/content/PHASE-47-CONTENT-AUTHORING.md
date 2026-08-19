# VATTAMS Academy Phase 47 — Content Authoring & Publishing Workflow

## Purpose
Create a controlled content workflow for the Academy learning catalogue.

## Workflow
Draft → Review → Published → Archived

## Content types
- Lesson
- Material
- Assignment
- Test
- Competition

## Validation
- Unique content ID required
- Title required
- Existing course ID required
- Description recommended
- Non-negative display order
- Version number >= 1

## Publishing
Content must pass validation and enter Review before the Publish action becomes available.

## Data safety
Phase 47 does not automatically insert, update or delete Supabase content. It provides the authoring workflow foundation without guessing the existing Tuition database schema.

Historical Tuition data remains untouched.
