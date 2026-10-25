# Project Status

Last updated: 2026-10-25

## Project

- Name: NPC-icons
- Framework: Astro
- Current working branch: `feature/permanent-icon-ids`
- Last known committed baseline: `3028d8f`
- Deployment: https://icons.x0u0x.xyz/
- Repository: https://github.com/newDDF/NPC-icons

Always verify the current branch, commit, and working tree before relying
on these values.

## Product and Build Overview

The project builds an icon browsing website and distributes icon assets
through generated pages, data files, API-compatible outputs, and package files.

The production build pipeline includes:

1. `build.cjs` — prepares generated public data and site files.
2. `ecosystem.cjs` — prepares icon package data and assets.
3. Astro — builds the website and generated routes.

The root production build and development preparation scripts can modify
or recreate generated directories. Do not use the production working tree
as a disposable test environment.

## Icon Lifecycle and Compatibility

Permanent icon IDs and the retirement lifecycle have been implemented.

Key principles:

- Permanent IDs identify icons independently of their filenames.
- Legacy ID mappings support compatibility with older references.
- Retired icons must follow the lifecycle rules implemented in the source.
- Tests should verify both active and retired behavior.
- Inspect the current implementation before changing lifecycle semantics.

## Smoke Build

`npm run build:smoke` runs a build in a temporary project copy.

Its purpose is to test representative build behavior without switching
production configuration or overwriting production outputs.

The smoke test currently uses isolated fixtures to check active icons,
a retired record, SVG and PNG assets, permanent IDs, legacy aliases,
sitemap behavior, and package contents.

The smoke script also snapshots selected production files, verifies that
they remain unchanged, and cleans up its temporary directory.

## Last Recorded Validation

The following results were reported during the current development session:

- Smoke build: passed; 17 assertions passed.
- Retirement lifecycle test: passed; 11 checks passed.
- Build audit: passed; 29 checks, 0 warnings, 0 failures.
- `node --check tests/smoke/build.cjs`: passed.
- `git diff --check`: passed.

Re-run relevant checks before relying on these results for a later change.

## Current Work in Progress

The current task adds an isolated smoke-build script and its npm command.

Expected files for that change:

- `package.json`
- `tests/smoke/build.cjs`

AI handoff documentation is being added before the change is committed.
Verify the actual Git index and working tree before staging or committing.

## Safety Constraints

- Keep production build scripts unchanged unless explicitly required.
- Do not run destructive build preparation against production data for tests.
- Do not delete existing `.bak` files or `FETCH_HEAD`.
- Do not commit, push, or merge without explicit authorization.
- Do not stage unrelated files.

## Suggested Next Steps

1. Finish reviewing the smoke-build script and its isolation guarantees.
2. Review all intended staged changes and the new documentation.
3. Re-run the smoke build, lifecycle test, and production audit as appropriate.
4. Commit only the explicitly approved files.
5. Update this status document after validation or project-state changes.
