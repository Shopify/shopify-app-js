---
description: Add refresh token support to a session storage package
argument-hint: [package-path]
model: sonnet
allowed-tools: Task, AskUserQuestion, Read, Edit, Write, Glob, Grep, Bash(git *), Bash(gh *), Bash(pnpm *), Bash(npx *), Bash(ls *), Bash(df *), Bash(timeout *), Bash(node *), Bash(wc *), WebFetch
---

# Session Storage Refresh Token Migration Workflow

You are orchestrating the addition of refresh token support to a session storage package. The package path is:

**$ARGUMENTS**

---

## Overview

This workflow adds support for storing OAuth refresh tokens and their expiration dates in a session storage package, following the pattern established in PR #2938 for the Prisma package.

The changes enable apps to refresh expired access tokens without requiring user re-authentication by storing two new optional fields:
- `refreshToken`: The OAuth refresh token returned from Shopify
- `refreshTokenExpires`: The expiration date of the refresh token

**Note**: This workflow depends on the centralized batteryOfTests refresh token functionality from the `migrate-refresh-token-tests-to-battery` branch. Branches created by this skill will be based on that branch until it's merged to main.

---

## Phase 0: Worktree Setup & Validation

Before launching any subagents, set up an isolated worktree so this workflow doesn't disturb the main repo checkout. This enables running multiple migration workflows in parallel.

1. **Determine MAIN_REPO_PATH**:
   - Use the primary working directory: `/Users/richardpowell/src/github.com/Shopify/shopify-app-js`
   - This will be referred to as `MAIN_REPO_PATH` throughout
   - All git commands should use: `git -C MAIN_REPO_PATH <subcommand>`

2. **Validate the package path**:
   - Verify that `$ARGUMENTS` is a valid path relative to MAIN_REPO_PATH to a session storage package (should match pattern `packages/apps/session-storage/shopify-app-session-storage-*`)
   - Check that the path exists: use Read tool on `MAIN_REPO_PATH/$ARGUMENTS/package.json`
   - If the path is invalid or doesn't exist, stop and report an error
   - Extract the package name from the path (e.g., `redis` from `shopify-app-session-storage-redis`)

3. **Check if already migrated**:
   - Use Grep to search for "refreshToken" in `MAIN_REPO_PATH/$ARGUMENTS/src/*.ts`
   - Use Read to check if `MAIN_REPO_PATH/$ARGUMENTS/MIGRATION_TO_EXPIRING_TOKENS.md` exists
   - If either found, ask user: "This package may already have refresh token support. Continue anyway?"
   - If user says no, stop here

4. **Pre-flight checks**:
   - Check available disk space in /tmp: `df -h /tmp`
   - Verify at least 500MB free space is available
   - If insufficient space, report error and stop
   - Define WORKTREE path: `/tmp/session-storage-refresh-token-<package-name>`
   - Check if WORKTREE path already exists: `ls /tmp/session-storage-refresh-token-<package-name> 2>&1`
   - If exists, ask user: "Worktree path already exists. Options: (1) Remove and continue, (2) Use different path, (3) Cancel"
   - Handle user choice accordingly

5. **Generate a unique branch name**:
   - Create a branch name: `refresh-tokens-<package-name>`
   - Example: `refresh-tokens-redis`

6. **Check if branch already exists**:
   - Run `git -C MAIN_REPO_PATH branch --list <branch-name>` to check for existing local branch
   - Run `git -C MAIN_REPO_PATH ls-remote --heads origin <branch-name>` to check for existing remote branch
   - If either exists, ask the user if they want to:
     - Overwrite the existing branch (will reset it to main)
     - Use a different branch name
     - Cancel the operation

7. **Fetch latest migrate-refresh-token-tests-to-battery**:
   ```
   git -C MAIN_REPO_PATH fetch origin migrate-refresh-token-tests-to-battery
   ```

8. **Create a worktree** (referred to as `WORKTREE` hereafter) at `/tmp/session-storage-refresh-token-<package-name>`:
   ```
   git -C MAIN_REPO_PATH worktree add /tmp/session-storage-refresh-token-<package-name> -b <branch-name> origin/migrate-refresh-token-tests-to-battery
   ```
   This creates a new branch based on the latest migrate-refresh-token-tests-to-battery branch.

9. **Install dependencies**:
   ```
   pnpm --dir WORKTREE install
   ```

10. **Verify the package builds and tests pass** (baseline validation):
    - Determine the package's npm name from `WORKTREE/<package-path>/package.json` (usually `@shopify/shopify-app-session-storage-<package-name>`)
    - Run `pnpm --dir WORKTREE --filter @shopify/shopify-app-session-storage-<package-name> build`
    - Run `pnpm --dir WORKTREE --filter @shopify/shopify-app-session-storage-<package-name> lint`
    - Run `pnpm --dir WORKTREE --filter @shopify/shopify-app-session-storage-<package-name> test`
    - If any of these fail, the package is in a broken state. Report this and STOP - cannot proceed with a broken baseline as it makes it impossible to verify if the migration caused issues.

All subsequent phases must operate within `WORKTREE`. Pass this path to every subagent.

### IMPORTANT: Command patterns for subagents

All subagents MUST follow these rules to avoid unnecessary permission prompts:

- **Never use `cd <dir> && command`**. Claude Code is shell-operator aware and will not auto-approve compound commands joined by `&&`, `||`, `;`, or `|`.
- **For git**: Use `git -C WORKTREE <subcommand>` instead of `cd WORKTREE && git <subcommand>`.
- **For pnpm**: Use `pnpm --dir WORKTREE <subcommand>` instead of `cd WORKTREE && pnpm <subcommand>`.
- **For npx**: Use `npx --prefix WORKTREE <subcommand>`.
- **For file listing**: Use `ls WORKTREE/path` (absolute path) instead of `cd WORKTREE && ls path`.
- **For all other commands**: Always pass absolute paths to the command rather than `cd`-ing first.
- **For reading files**: Prefer the `Read` tool over `cat`. Prefer the `Grep` tool over shell `grep`/`rg`. Prefer the `Glob` tool over shell `find`/`ls` for file searching.
- **Keep commands simple**: Run one command per Bash call. Avoid chaining with `&&`, `||`, or pipes where possible. If you need multiple pieces of information, make multiple parallel tool calls.

---

Execute this workflow in 3 phases using specialized subagents. Each phase must complete before the next begins.

---

## Phase 1: PLANNER (Analysis & Design)

Use the Task tool with `subagent_type: "general-purpose"` and `max_turns: 30` to run a **Planner agent**. Pass it `WORKTREE` and the target package path.

### Context to provide the Planner

Provide the Planner with this hardcoded context from PR #2938:

**Reference Implementation**: The Prisma package implementation from PR #2938 serves as the reference. Key changes included:

1. **Schema Changes** (for Prisma):
   - Added two new optional fields to the Session model:
     ```prisma
     refreshToken        String?
     refreshTokenExpires DateTime?
     ```

2. **Code Changes** (Prisma `src/prisma.ts`):
   - Lines 193-194: Added to `sessionToRow` method:
     ```typescript
     refreshToken: sessionParams.refreshToken || null,
     refreshTokenExpires: sessionParams.refreshTokenExpires || null,
     ```
   - Lines 235-241: Added to `rowToSession` method:
     ```typescript
     if (row.refreshToken) {
       sessionParams.refreshToken = row.refreshToken;
     }

     if (row.refreshTokenExpires) {
       sessionParams.refreshTokenExpires = row.refreshTokenExpires.getTime();
     }
     ```

3. **Migration Documentation**: A `MIGRATION_TO_EXPIRING_TOKENS.md` file was added explaining:
   - How to update the schema (for Prisma: running `npx prisma migrate dev` and `npx prisma generate`)
   - How to enable the feature via the `future.expiringOfflineAccessTokens` flag

4. **Testing**: Tests were updated to verify that sessions with refresh tokens are properly stored and retrieved.

### Planner Mission

The Planner should:

1. **Examine the target package structure**:
   - Read the main implementation file (usually `src/<package-name>.ts`)
   - **CRITICAL: Determine if migration is required**:
     - If the storage stores the complete Session object directly (like memory storage), NO migration is required
     - If the storage uses schema-based serialization (SQL, Prisma, Drizzle, NoSQL schemas), migration IS required
   - Identify how sessions are serialized/deserialized (methods like `sessionToRow`, `sessionToObject`, `databaseRowToSession`, etc.)
   - Determine the database/storage schema (look for SQL CREATE TABLE statements, schema files, type definitions, or documentation)
   - Check if the package uses a migration system

2. **Compare with the Prisma reference implementation**:
   - Identify the equivalent methods that need updating (similar to `sessionToRow` and `rowToSession` in Prisma)
   - Determine if database schema changes are needed and how they should be applied
   - Check if there are existing migration files to use as a pattern

3. **Assess the testing approach**:
   - Review the test files to understand how sessions are tested
   - Identify where refresh token tests should be added
   - Look for test utilities or fixtures that need updating

4. **Produce a detailed implementation plan** that includes:
   - Package name and storage type (e.g., Redis, MySQL, PostgreSQL, Memory)
   - **Migration required: YES or NO** (with clear justification)
   - List of files that need to be modified with specific line numbers and changes
   - Database/schema changes required (SQL statements, schema definitions, or configuration changes) - ONLY if migration required
   - Migration steps needed (if applicable) - ONLY if migration required
   - Test changes required: **Must specify using batteryOfTests with testRefreshTokens: true**
   - Documentation updates needed:
     - README.md (if applicable)
     - MIGRATION_TO_EXPIRING_TOKENS.md - **ONLY if migration required**
   - Any package-specific considerations or edge cases
   - Risk assessment (low/medium - should generally be low as fields are optional or test-only)

The Planner should NOT make any code changes. Research and design only.

---

## Phase 2: IMPLEMENTER (Code, Test & Iterate)

Use the Task tool with:
- `subagent_type: "general-purpose"`
- `model: "opus"` (use Opus for complex implementation work)
- `max_turns: 75`

to run an **Implementer agent**. Pass it `WORKTREE`, the target package path, and the complete plan from Phase 1.

### Step 1: Apply code changes

Following the plan from Phase 1:

1. **Update session serialization/deserialization**:
   - Add `refreshToken` and `refreshTokenExpires` to the method that converts sessions to storage format
   - Add `refreshToken` and `refreshTokenExpires` to the method that converts storage format back to sessions
   - Handle null/undefined values appropriately (fields are optional)
   - For timestamp fields: ensure proper conversion (e.g., `getTime()` for Date objects, seconds vs milliseconds)
   - **SECURITY**: Ensure refresh tokens are NOT logged or exposed in debug output. Review any logging statements to confirm sensitive tokens are redacted.

2. **Update database schema** (if applicable):
   - For SQL-based storages (MySQL, PostgreSQL, SQLite): Add migration files following existing patterns
   - For Prisma/Drizzle: Update schema definitions
   - For NoSQL (MongoDB, DynamoDB, Redis): Update type definitions and ensure serialization handles new fields
   - For KV stores: Update the serialization format
   - Ensure new fields are optional/nullable to maintain backward compatibility

3. **Update TypeScript types** (if applicable):
   - Update any Row or Database types to include the new fields
   - Ensure types are marked as optional

4. **Write a changeset file** at `.changeset/session-storage-<package-name>-refresh-tokens.md`:

   **If the package requires schema/code changes** (e.g., SQL databases, Prisma, Drizzle):
   ```markdown
   ---
   '@shopify/shopify-app-session-storage-<package-name>': minor
   ---

   Add support for storing refresh tokens and refresh token expiration dates. This enables apps using expiring offline access tokens to automatically refresh tokens without user re-authentication.

   ## Migration Guide

   [INCLUDE THE COMPLETE MIGRATION INSTRUCTIONS HERE - DO NOT just reference MIGRATION_TO_EXPIRING_TOKENS.md]

   ### Step 1: Update your schema

   [Specific commands for this storage type, e.g.:]
   - For Prisma: Run `npx prisma migrate dev` and `npx prisma generate`
   - For SQL: Execute the migration SQL provided in MIGRATION_TO_EXPIRING_TOKENS.md
   - For Drizzle: Run `npx drizzle-kit generate` and apply migrations

   ### Step 2: Enable the feature

   Update your app configuration to enable expiring offline access tokens:

   ```typescript
   future: {
     expiringOfflineAccessTokens: true,
   }
   ```

   ### Step 3: Verify

   - New OAuth flows will automatically store refresh tokens
   - Existing sessions continue to work without refresh tokens (fields are optional)

   For detailed instructions, see `MIGRATION_TO_EXPIRING_TOKENS.md` in this package.
   ```

   **If the package requires NO changes** (e.g., memory storage that stores complete Session objects):
   ```markdown
   ---
   '@shopify/shopify-app-session-storage-<package-name>': patch
   ---

   Add test coverage for refresh token storage using the centralized batteryOfTests suite. Memory storage already supports refresh tokens (it stores the complete Session object), but this change adds explicit test verification.

   **Note**: This is a test-only change. No code changes or migrations required.
   ```

5. **Create MIGRATION_TO_EXPIRING_TOKENS.md** (ONLY if migration is required):
   - **IMPORTANT**: Only create this file if the storage implementation requires schema or code changes
   - Do NOT create this file for storage implementations that automatically preserve all Session fields (like memory storage)
   - Use the Prisma package's migration guide as a template
   - Adapt it for the specific package's schema/migration approach
   - Include:
     - Overview of the change
     - Specific schema/migration commands for this storage type
     - How to enable the feature (future flag)
     - Example of accessing the refresh token fields
   - **CRITICAL**: The contents of this migration guide MUST also be included in the changeset file (step 4 above)
     - The changeset serves as the release notes that users see in CHANGELOG.md
     - Users need to see migration instructions directly in the changelog, not just a reference to another file
     - Include the full step-by-step migration instructions in the changeset's "Migration Guide" section

6. **Update README.md** (if applicable):
   - Add a link to the migration guide
   - Mention refresh token support in the features/description section

### Step 2: Update tests

**IMPORTANT: Use the centralized batteryOfTests suite for refresh token testing**

1. **Enable refresh token tests in batteryOfTests**:
   - Locate the test file (usually `src/__tests__/<package-name>.test.ts`)
   - Find the `batteryOfTests()` call
   - Update it to enable refresh token tests by passing `true` as the third parameter:
     ```typescript
     // Before
     batteryOfTests(async () => storage);

     // After
     batteryOfTests(async () => storage, false, true);
     //                                   ^     ^
     //                                   |     testRefreshTokens: true
     //                                   testUserInfo: false (or true if already enabled)
     ```
   - **Do NOT add custom refresh token tests** - the batteryOfTests suite provides comprehensive coverage

2. **Remove any existing custom refresh token tests**:
   - If the package already has a custom "can store and delete sessions with refresh tokens" test, remove it
   - The centralized test in batteryOfTests provides the same coverage

3. **Ensure existing tests still pass**:
   - Run the test suite to verify backward compatibility
   - All existing tests should continue to pass, plus you'll now have the refresh token test from batteryOfTests

### Step 3: Local validation

1. Run `pnpm --dir WORKTREE install` to ensure dependencies resolve (especially if schema changes require regeneration)
2. Determine the package's npm name from the package.json (usually `@shopify/shopify-app-session-storage-<package-name>`)
3. Run `pnpm --dir WORKTREE --filter @shopify/shopify-app-session-storage-<package-name> build` to verify the package builds
4. **Type safety check**: Run `pnpm --dir WORKTREE --filter @shopify/shopify-app-session-storage-<package-name> exec tsc --noEmit` to verify no TypeScript errors exist
5. Run `pnpm --dir WORKTREE --filter @shopify/shopify-app-session-storage-<package-name> lint` to catch any linting issues
6. Run `pnpm --dir WORKTREE --filter @shopify/shopify-app-session-storage-<package-name> test` to run the test suite
7. If any checks fail, capture the specific error details and fix the issue, then retry. Iterate up to 3 times before reporting failure to orchestrator.

### Step 4: Commit changes

Once all local validation passes:

1. **Stage all changes**: `git -C WORKTREE add -A`
2. **Commit with a descriptive message**:
   ```
   git -C WORKTREE commit -m "$(cat <<'EOF'
   feat: add refresh token support to <package-name> session storage

   - Add refreshToken and refreshTokenExpires fields to session storage
   - Add database migration for new fields (if applicable)
   - Update tests to verify refresh token persistence
   - Add MIGRATION_TO_EXPIRING_TOKENS.md with upgrade instructions

   This enables apps using expiring offline access tokens to store and
   retrieve refresh tokens for automatic token renewal.

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
   EOF
   )"
   ```

### Step 5: Push changes

1. **Push to the branch**: `git -C WORKTREE push -u origin <branch-name>`
2. Report that changes are pushed and ready for Phase 3 (PR creation and CI validation will happen there).

**Error Handling**: If any step fails, the Implementer should:
- Capture the full error output and specific failure details
- For test failures: note which specific tests failed and why
- For build failures: note the specific compilation errors
- For lint failures: note the specific linting violations
- Diagnose the root cause and fix the issue
- Retry the validation steps
- Iterate up to 3 times on local validation failures before reporting failure to orchestrator with detailed diagnostics

---

## Phase 3: QA REVIEWER (Final Review & PR Creation)

Use the Task tool with `subagent_type: "general-purpose"` and `max_turns: 30` to run a **QA Reviewer agent**. Give it:
- `WORKTREE` so it can read files
- The original plan from Phase 1
- The list of all changes made by the Implementer
- The package path and branch name

The QA Reviewer should:

1. **Verify all planned changes were implemented**:
   - Check each file mentioned in the plan was updated
   - Verify the serialization/deserialization methods include the new fields
   - Verify schema changes are present and correctly formatted
   - Verify tests were added

2. **Check for completeness**:
   - Confirm both `refreshToken` and `refreshTokenExpires` are handled (if code changes were made)
   - Confirm fields are optional/nullable (if applicable)
   - Confirm timestamp conversions are correct (if applicable)
   - Confirm the changeset file exists and is properly formatted
   - **If migration is required**:
     - Confirm MIGRATION_TO_EXPIRING_TOKENS.md exists and is helpful
     - **CRITICAL**: Confirm the changeset includes the full migration guide contents, not just a reference
     - The changeset should have a "## Migration Guide" section with step-by-step instructions
   - Confirm tests use `batteryOfTests` with `testRefreshTokens: true` instead of custom tests

3. **Check for code quality**:
   - Ensure changes follow the existing code style and patterns
   - Ensure no unrelated changes were made
   - Ensure error handling is appropriate

4. **Verify backward compatibility**:
   - Confirm that existing sessions without refresh tokens will still work
   - Confirm no breaking changes to public APIs

5. **Create a Pull Request**:
   - Use `gh pr create` with:
     - Title: `feat: add refresh token support to <package-name> session storage` (or `test: add refresh token test coverage` if test-only)
     - Body should include:
       - **Summary**: Explain that this adds refresh token support (or test coverage), following the pattern from #2938 and using the centralized batteryOfTests suite
       - **Changes**: List all files modified and what was changed
       - **Migration Required**:
         - If migration IS required: "Yes - See MIGRATION_TO_EXPIRING_TOKENS.md for schema update instructions"
         - If NO migration required: "No - This storage already supports refresh tokens" or "No - Test coverage only"
       - **Testing**: Confirm all tests pass, refresh token tests enabled via batteryOfTests (not custom tests), and backward compatibility verified
       - **Dependencies**: "Depends on #3041 (centralized refresh token tests in batteryOfTests)"
       - **Review Focus**: Highlight any package-specific considerations (schema approach, timestamp handling, or note if it's test-only)
       - Footer: "🤖 Generated with Claude Code using the `session-storage:add-refresh-token-support` skill\n\nRelated: #2938, #3041"

6. **Wait for CI to complete**:
   - Get the PR number from the created PR
   - Run `gh pr checks <PR_NUMBER> --watch --fail-level all` with a 10-minute timeout (`timeout: 600000`)
   - If CI times out, note that CI is still running and the user should check it later
   - If CI passes, note this in the report
   - If CI fails:
     - Fetch the failed logs using `gh run view <run-id> --log-failed`
     - Analyze the failures
     - Note specific failures in the report but do NOT attempt to fix them (the Implementer should have caught these)
     - Mark the verdict as NEEDS_FIXES instead of PASS

7. **Produce a final report**:
   - PASS/NEEDS_FIXES/PARTIAL (PARTIAL if CI timed out) verdict
   - List of all files changed with brief descriptions
   - PR URL
   - CI status (passing/failing/running)
   - If failing: summary of what failed
   - Any concerns or items needing manual review
   - Recommendation

---

## Final Output

After all phases complete, present a summary using this format:

```
## REFRESH TOKEN MIGRATION SUMMARY
- **Status**: COMPLETED | NEEDS_FIXES | PARTIAL | FAILED
- **Package**: <package-name>
- **Branch**: <branch-name>
- **PR**: <PR URL or "Not created">
- **Risk**: low | medium
- **CI Status**: ✅ Passing | ❌ Failing | ⏳ Running | ⏸️ Not started

### Changes made
- <file path>: <brief description>

### Tests
- ✅ All local tests pass
- ✅ New refresh token tests added
- ✅ Backward compatibility verified
- [if applicable] ❌ CI tests failing: <reason>

### Migration required
- Yes/No
- If yes: Brief summary of what users need to do (see MIGRATION_TO_EXPIRING_TOKENS.md)

### QA verdict
- <PASS/NEEDS_FIXES/PARTIAL with brief rationale>

### Next steps
- Review the PR at <URL>
- [if CI failing] Fix CI failures: <specific issues>
- [if applicable] Verify migration instructions on a test database
- Merge when approved and CI is green
```

**Status meanings:**
- **COMPLETED**: All phases ran successfully, PR created, CI passing, ready for human review
- **NEEDS_FIXES**: All phases ran but CI is failing, requires fixes before merge
- **PARTIAL**: All phases ran but CI is still running, check back later
- **FAILED**: An error occurred during setup, implementation, or validation that prevented completion

If anything needs manual attention, clearly call it out.

---

## Cleanup

After all phases complete, handle cleanup based on the outcome:

1. **If COMPLETED or NEEDS_FIXES** (PR was created):
   - Ask user: "Remove worktree at `/tmp/session-storage-refresh-token-<package-name>`? (Recommended: Yes to free ~500MB disk space)"
   - If yes: Remove worktree
   - If no: Report path for manual cleanup later: "Worktree preserved at `/tmp/session-storage-refresh-token-<package-name>` for manual inspection"

2. **If FAILED** (workflow failed before PR creation):
   - Ask user with multiple choice:
     - "Keep worktree for debugging (recommended)"
     - "Remove worktree only"
     - "Remove worktree AND delete remote branch <branch-name>"
   - Act based on user choice
   - If keeping worktree, report: "Worktree preserved at `/tmp/session-storage-refresh-token-<package-name>` for debugging"

**Cleanup commands** (when removing):
```bash
git -C MAIN_REPO_PATH worktree remove /tmp/session-storage-refresh-token-<package-name>
# If that fails due to uncommitted changes:
git -C MAIN_REPO_PATH worktree remove --force /tmp/session-storage-refresh-token-<package-name>
git -C MAIN_REPO_PATH worktree prune
```

**To delete remote branch** (if requested after failure):
```bash
git -C MAIN_REPO_PATH push origin --delete <branch-name>
```

---

## Notes

- This workflow is designed to be safe and reversible. All changes are made in an isolated worktree and pushed to a feature branch.
- The new fields are optional, ensuring backward compatibility with existing sessions.
- Multiple packages can be migrated in parallel by running this skill multiple times with different package paths in separate terminal tabs.
- If the package has unique requirements or patterns that deviate significantly from the Prisma implementation, the Planner should identify these and adjust the approach accordingly.
