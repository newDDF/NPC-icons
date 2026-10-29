# NPC-icons — AI Development Handoff Report

**Report date:** October 29, 2026
**Repository:** https://github.com/newDDF/NPC-icons
**Local path:** `/Users/ddf/github/NPC-icons`
**Current branch:** `feature/permanent-icon-ids`
**Latest known local commit:** `8846588`
**Latest commit message:** `test: expand smoke coverage for package APIs`
**Status:** The latest commit was created locally and had not been pushed at the time of this report.

## 1. Instructions for the Next AI

Continue development from the existing repository. Do not recreate the project or begin a broad refactor without reviewing the current implementation.

Before making changes, inspect:

1. `AGENTS.md`
2. `docs/PROJECT-STATUS.md`
3. `docs/CHANGELOG-AI.md`
4. Current Git status, branch, recent commits, and the latest commit diff
5. The implementation and tests related to the requested task

The repository and current source code take precedence over this report if their state differs.

### Mandatory Development Rules

- Communicate with the user in Chinese unless requested otherwise.
- All project source code, comments, test descriptions, logs, and documentation must be written in English.
- Prefer small, incremental changes with clear validation.
- Preserve existing UI layout, animations, interactions, and functionality unless the user requests changes.
- Never delete, overwrite, rename, or clean up existing backup files or unrelated untracked files without explicit authorization.
- Do not modify production configuration or production data just to test a change.
- Check `git status` before editing and inspect `git diff` afterward.
- Stage only files relevant to the agreed task.
- Never commit, push, merge, release, or deploy without explicit user approval.
- Never claim that a command, test, build, or deployment succeeded unless its result was actually observed.
- A passing smoke build does not prove that the production build or live deployment is healthy.
- Do not assume that untracked backup files are disposable.

## 2. Project Overview

NPC-icons is an Astro-based icon library website with generated icon metadata, public JSON APIs, permanent icon IDs, legacy aliases, retired-ID handling, and an npm package.

Known capabilities include:

- Icon catalog and detail pages
- SVG and PNG assets
- Search and category filtering
- Generated JSON data and public API endpoints
- Permanent icon IDs and legacy aliases
- Retired icon ID lifecycle handling
- An npm package with icon data and helper functions
- An isolated smoke-build test workflow

Live website: https://icons.x0u0x.xyz/

The project's development priority is to improve reliability and maintain compatibility while avoiding unnecessary changes to production data.

## 3. Git State at Handoff

The latest user-reported status was:

    ## feature/permanent-icon-ids...origin/feature/permanent-icon-ids [ahead 1]

Latest local commit:

    8846588 test: expand smoke coverage for package APIs

The commit modifies one tracked file:

    tests/smoke/build.cjs

Commit summary:

    1 file changed, 93 insertions(+)

The commit had not been pushed at the time of the latest status check.

The working tree had no remaining tracked modifications after the commit. Numerous untracked files remained, including `FETCH_HEAD` and timestamped `.bak` files throughout the repository.

Preserve these untracked files. Do not stage them or include them in future commits unless the user explicitly requests it.

Always obtain a fresh status report before continuing, as the repository may have changed since this report was written.

## 4. Latest Completed Work

The latest change enhanced `tests/smoke/build.cjs` with two groups of checks.

### 4.1 npm Package Asset Validation

The smoke test now verifies that every packaged icon:

- Has a relative asset path beginning with `./assets/`
- Resolves within the npm package assets directory
- Points to an existing regular file

The smoke fixture contains three active icons: two SVG files and one PNG file.

### 4.2 Package API Validation

The smoke test invokes the package API in an isolated Node.js process and verifies:

- `getIcon()` resolves permanent IDs.
- `getIcon()` resolves legacy aliases.
- `getIcon()` matches icon names without case sensitivity.
- `getIcon()` supports explicit PNG format selection.
- Unknown IDs return `null`.
- Unmatched explicit formats return `null`.
- `searchIcons()` matches names, descriptions, and categories.
- Blank search queries return an empty array.
- `getIconSvg()` returns SVG content for an SVG icon.
- `getIconSvg()` returns `null` for PNG icons.
- `getIconSvg()` returns `null` for unknown icons.
- `getStats()` matches the generated smoke fixture counts.

## 5. Validation Results

The user ran the following checks and reported successful results:

    node --check tests/smoke/build.cjs
    git diff --check
    npm run build:smoke

The smoke build completed successfully with:

    SMOKE BUILD PASSED
    Production files were not used as build output.

The isolated fixture generated nine static pages and validated the package API, metadata, categories, permanent IDs, legacy aliases, retired-ID behavior, and npm package assets.

The production integrity checks reported that these files remained unchanged:

- `config.json`
- `data/id-registry.json`
- `data/legacy-id-map.json`
- `public/data/icons.json`
- `public/api/icons.json`
- `dist/index.html`

The temporary smoke directory was cleaned up successfully.

These results apply to the smoke-test fixture and the checks actually executed. Do not infer that the full production build or live website was tested by this run.

## 6. Relevant API Implementation

The current known implementation is in:

    packages/npc-icons/index.js

It exports:

- `getIcons(options = {})`
- `getIcon(name, format)`
- `searchIcons(query)`
- `getIconSvg(name)`
- `getStats()`

Observed behavior from the reviewed implementation:

- `getIcons()` optionally filters by format and category.
- Multiple categories use OR matching.
- `getIcon()` can resolve permanent IDs, legacy IDs, legacy ID arrays, and icon names.
- Icon name matching is case-insensitive.
- An explicitly requested unmatched format returns `null`.
- Without a format, `getIcon()` prefers SVG before falling back to another matching format.
- `searchIcons()` trims and lowercases the query and searches names, descriptions, and categories.
- Blank search queries return no results.
- `getIconSvg()` returns SVG content for matching SVG icons and `null` for missing or non-SVG icons.
- `getStats()` loads generated statistics from the package data directory.

The declaration file is:

    packages/npc-icons/index.d.ts

Review the actual implementation and type declarations before extending or changing these contracts.

## 7. Smoke Test Architecture

The main isolated smoke test is:

    tests/smoke/build.cjs

The test creates a temporary project copy and uses a small fixture containing three active icons and one retired registry entry.

Known fixture identifiers:

- `900001`: `smoke-circle`, SVG
- `900002`: `smoke-wordmark`, SVG
- `900003`: `smoke-pixel-png`, PNG
- `900004`: retired ID

Legacy aliases are included to test backward compatibility.

The smoke workflow builds the isolated fixture, verifies generated pages and API responses, validates package metadata and assets, checks production file integrity, and cleans up its temporary directory.

Use the existing smoke infrastructure instead of creating a separate test harness without a clear need.

## 8. Recommended Next Steps

Proceed in this order:

1. Obtain a fresh Git status and inspect the latest commit.
2. Read the project instructions and status documents.
3. Confirm whether commit `8846588` has been pushed.
4. Preserve all untracked backups and `FETCH_HEAD`.
5. Ask the user which feature or problem should be addressed next if no task has been specified.
6. Inspect relevant code before proposing changes.
7. Make the smallest appropriate change and create a backup when warranted by the repository's established workflow.
8. Run targeted validation first, followed by `npm run build:smoke` when relevant.
9. Check `git diff --check`, review the final diff, and confirm that unrelated production files remain unchanged.
10. Obtain explicit user approval before committing or pushing.

Do not start a broad refactor solely because this handoff report exists.

## 9. Git and Deployment Safety

The latest known branch is:

    feature/permanent-icon-ids

Do not switch branches or merge into `main` without a reason and user approval.

Before pushing, verify:

- The target branch is correct.
- The latest commit is the intended commit.
- No unintended files were committed.
- Tests passed.
- The user explicitly approved the push.

Never use broad staging commands such as:

    git add .
    git add -A

Prefer explicit paths, for example:

    git add tests/smoke/build.cjs

Do not delete backups or clean the working directory as a shortcut to make Git status look clean.

## 10. User Collaboration Preferences

The user prefers:

- Short, sequential instructions
- Copy-and-paste-ready terminal commands
- A read-only inspection phase before edits
- Clear explanations of what each command changes
- Minimal risk to production data
- No unsolicited refactors
- No commits or pushes without explicit approval
- English-only project code and documentation
- Chinese conversational explanations

When an error occurs, first inspect the exact current state. Do not immediately restore files, overwrite content, or delete backups.

## 11. Handoff Summary

The latest known change improves smoke-test coverage for the npm package assets and the four package API functions. The user reported that the smoke build passed, production files remained unchanged, and commit `8846588` was created locally.

The commit was one commit ahead of the remote feature branch at the last status check. Pushing was not confirmed.

Start by verifying the actual Git state, preserve all existing untracked files, and continue only after identifying the user's next development priority.
