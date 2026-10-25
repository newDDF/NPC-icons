# AI Development Guide

## Project Overview

NPC-icons is an Astro-based icon library website with generated icon pages,
search and browsing interfaces, downloadable assets, and package/API outputs.

The repository contains build scripts, source components, icon assets,
metadata, generated data, tests, and package distribution files.

## Required Reading

Before making changes:

1. Read this file.
2. Read `docs/PROJECT-STATUS.md`.
3. Review the latest relevant entry in `docs/CHANGELOG-AI.md`.
4. Inspect the actual source code and Git state relevant to the task.
5. Read additional architecture or test documentation when needed.

Documentation is a handoff aid, not a substitute for verifying the code.

## Engineering Rules

- Preserve existing behavior unless the task explicitly requires a change.
- Prefer small, reviewable changes over broad refactoring.
- Keep code, comments, identifiers, and project documentation in English.
- Inspect dependencies and data flow before changing shared build logic.
- Do not assume generated files are source-of-truth files.
- Do not change production configuration or production data merely to
  facilitate testing.
- Keep smoke tests isolated from the production working tree.
- Preserve existing backups and unrelated untracked files.
- Never delete or overwrite unrelated user data.

## Git and Change Safety

- Inspect `git status --short --branch` before editing.
- Do not discard, reset, clean, or overwrite existing user changes.
- Do not commit, push, merge, or create releases without explicit approval.
- Stage only files that belong to the agreed task.
- Review staged changes with `git diff --cached --check` and
  `git diff --cached --stat` before committing.
- Report relevant untracked files without deleting them.

## Validation

Choose checks appropriate to the affected code. Relevant project checks
may include:

- `npm run build:smoke`
- `node tests/lifecycle/retirement.test.cjs`
- `node tests/diagnostics/audit-build.cjs`
- `git diff --check`

Do not claim a test passed unless it was actually executed and passed.
Distinguish completed checks from checks that remain outstanding.

## Handoff Maintenance

After a meaningful change:

1. Update `docs/PROJECT-STATUS.md` with the verified current state.
2. Append a dated entry to `docs/CHANGELOG-AI.md`.
3. Record the motivation, affected areas, validation results, and follow-up work.
4. Keep status concise; preserve historical details in the changelog.
5. Clearly label assumptions, known issues, and unverified work.

## Working Style

Explain the intended change and its risks before modifying sensitive build
or data lifecycle logic. Prefer incremental steps and concise instructions.
Do not expand the task scope without a clear reason.
