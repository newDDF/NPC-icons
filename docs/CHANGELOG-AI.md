# AI Development Changelog

This log records meaningful AI-assisted changes, their rationale, validation,
and follow-up work. Entries describe verified outcomes rather than intentions.

## 2026-10-25 — Isolated Smoke Build and Handoff Documentation

### Context

The production build pipeline can recreate generated directories. A test build
must therefore run in isolation instead of temporarily replacing production
configuration or assets.

### Changes

- Added the `build:smoke` npm script.
- Added `tests/smoke/build.cjs` to build a temporary project copy.
- Added isolated test data covering active and retired icon records.
- Added checks for SVG and PNG output, permanent IDs, legacy aliases,
  retired detail-page behavior, sitemap inclusion, and package contents.
- Added production-file integrity checks and temporary-directory cleanup.
- Added English-language AI handoff documentation.

### Design Decisions

- Keep existing production build and development scripts unchanged.
- Never switch production configuration to test fixtures.
- Verify selected production files remain unchanged after the smoke build.
- Preserve unrelated local files, backups, and Git metadata.
- Keep validation results explicit and reproducible.

### Validation Reported

- Smoke build: 17 assertions passed.
- Retirement lifecycle test: 11 checks passed.
- Build audit: 29 checks passed, 0 warnings, 0 failures.
- Smoke script syntax check passed.
- Git whitespace checks passed.

These results should be revalidated before a future release or substantial
build-system change.

### Follow-up

- Review the final staged diff.
- Confirm only intended files are staged.
- Commit the smoke-build change and handoff documentation after review.
- Do not push or merge without explicit authorization.

## Entry Template

For future changes, append a new dated entry using this structure:

### Context
What problem or requirement motivated the change?

### Changes
Which behaviors, files, or interfaces changed?

### Design Decisions
Why was this approach chosen? Which alternatives or risks matter?

### Validation
Which commands were run, and what were their actual results?

### Follow-up
What remains incomplete, risky, or worth investigating?
