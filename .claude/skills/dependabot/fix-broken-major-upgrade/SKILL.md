---
description: Process a major Dependabot PR: research breaking changes, apply fixes, validate CI
argument-hint: [pr-url]
model: opus
allowed-tools: Task, AskUserQuestion, Read, Edit, Write, Glob, Grep, Bash(git *), Bash(gh *), Bash(pnpm *), Bash(npx *), Bash(ls *), Bash(timeout *), Bash(node *), Bash(wc *), WebFetch, WebSearch
---

# Dependency Upgrade Workflow

You are orchestrating a major dependency upgrade from a Dependabot PR. The PR URL is:

**$ARGUMENTS**

---

## Phase 0: Worktree Setup

Before launching any subagents, set up an isolated worktree so this workflow doesn't disturb the main repo checkout. This enables running multiple upgrade workflows in parallel across different terminal tabs.

1. **Verify the PR is actionable**:
   - Run `gh pr view <number> --json state,headRefName,statusCheckRollup,mergeable` to get the PR state, branch name, CI status, and mergeability.
   - If the PR `state` is not `OPEN`, stop immediately — report that the PR is already merged/closed and there is nothing to do.
   - If **all CI checks are passing**, stop immediately — report that CI is already green and there is nothing to do. Skip to the Final Output section and report as **COMPLETED** with a note that no changes were needed. To determine this: look only at checks from the **"CI" workflowName** in `statusCheckRollup` (ignore `Changelog`, `Contributor License Agreement (CLA)`, and `Dependabot auto-merge` workflows). CI is passing if every CI workflow check has `conclusion` of `SUCCESS` or `SKIPPED`.
2. **Fetch the branch** from origin:
   ```
   git fetch origin <branch> main
   ```
3. **Create a worktree** (referred to as `WORKTREE` hereafter) at `/tmp/dependabot-upgrade-pr-<number>`:
   ```
   git worktree add /tmp/dependabot-upgrade-pr-<number> -B <branch> origin/<branch>
   ```
   The `-B` flag resets the local branch to match `origin/<branch>`, which handles re-runs cleanly.
4. **Install dependencies**: `pnpm --dir WORKTREE install`

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

Execute this workflow in 3 phases using specialized subagents. An optional Conflict Resolver agent may also be needed between Phase 1 and Phase 2. Each phase must complete before the next begins.

---

## Phase 1: PLANNER (Research & Analysis)

Use the Task tool with `subagent_type: "general-purpose"` and `max_turns: 30` to run a **Planner agent**. Pass it `WORKTREE` and the mission below.

1. **Fetch PR details** using `gh pr view <number> --json title,body,files,headRefName,baseRefName,statusCheckRollup,commits,mergeable` and `gh pr diff <number>`.
2. **Identify the dependency** being upgraded (name, old version, new version).
3. **Fetch the changelog/release notes** for the dependency. Try these sources in order:
   - The dependency's GitHub releases page (use `gh api` or `WebFetch` on `https://github.com/<owner>/<repo>/releases`)
   - The CHANGELOG.md in the dependency's repo
   - The dependency's MIGRATION.md or upgrade guide, if one exists
   - The npm page for the package
4. **Identify breaking changes** from the changelog between the old and new versions.
5. **Check branch freshness** (requires `origin/main` to be up to date — Phase 0 already fetched it):
   - Run `git merge-base --is-ancestor origin/main HEAD` to check if the branch includes the latest main. If not, note how far behind it is.
   - Check the PR's `mergeable` status from step 1. If it's `CONFLICTING`, note that the branch has merge conflicts with main that will need to be resolved before code changes.
6. **Check CI status** on the PR using `gh pr checks <number>`. If checks failed:
   - Fetch the failed workflow run logs using `gh run view <run-id> --log-failed`
   - If logs are expired/unavailable (common on old PRs), note this — CI will be re-run after the Implementer pushes changes.
   - Summarize what failed and why (if determinable)
7. **Analyze which packages in this monorepo** are affected by looking at the PR diff and searching for imports/usage of the upgraded dependency across the codebase.
8. **Assess consumer impact**. For each breaking change, classify it as:
   - **Internal-only**: Can be fully absorbed within this repo's code (e.g., updating internal API calls, fixing private type usage). These are safe to proceed with.
   - **Consumer-facing**: Would require consumers of these packages to change their code, configuration, or types (e.g., changed public API signatures, removed exports, changed behavior of public functions, new required peer dependencies). These must be avoided if at all reasonably possible.
9. **Produce a structured upgrade plan** that includes:
   - Dependency name and version change
   - Branch freshness: up to date / behind by N commits / has merge conflicts
   - Summary of breaking changes relevant to this codebase
   - For each breaking change: whether it is internal-only or consumer-facing
   - List of files/packages that need changes
   - Specific code changes needed (with file paths and descriptions)
   - Any new peer dependencies or configuration changes required
   - Risk assessment (high/medium/low)
   - **Explicit statement** of whether the upgrade can be completed without any consumer-facing breaking changes

The planner should NOT make any code changes. Research only.

---

## Merge Conflict Resolution

After the Planner completes, check the plan for merge conflicts.

**If the branch has merge conflicts with main**, resolve them before proceeding:

1. Fetch `origin main` and run `git merge origin/main` in `WORKTREE`.
2. If the merge completes cleanly, proceed to the breaking change gate.
3. If there are conflicts, use the Task tool with `subagent_type: "general-purpose"` and `max_turns: 30` to run a **Conflict Resolver agent**. Pass it `WORKTREE` and the Planner's analysis for context. Instruct it to:
   - List all conflicted files
   - Open each conflicted file and resolve the conflict markers by understanding both sides:
     - For **dependency version conflicts** (package.json): keep the Dependabot version bump while incorporating any unrelated changes from main
     - For **lock files** (pnpm-lock.yaml): after resolving package.json, delete the lock file and run `pnpm install` to regenerate it
     - For **source code conflicts**: merge both sides logically, preserving the intent of both the Dependabot change and the main branch changes
     - For **changeset or config conflicts**: incorporate changes from both sides
   - Stage all resolved files with `git add`
   - Complete the merge with `git commit --no-edit`
   - Verify the merge completed cleanly with `git status`
4. If the Conflict Resolver cannot resolve a conflict (e.g., deeply intertwined changes that require human judgment), it should report which files and conflicts remain unresolved.
5. If unresolvable conflicts remain, skip to the Final Output section and report as **FAILED** with details of which conflicts could not be resolved.

If the branch is clean (no conflicts) or conflicts were successfully resolved, proceed to the breaking change gate.

---

## Consumer-Facing Breaking Change Gate

After the Planner completes, review the plan yourself.

**If the plan identifies any consumer-facing breaking changes**, do NOT proceed to Phase 2. Instead:

1. Present the consumer-facing breaking changes to the user, clearly explaining what would break for consumers and why it cannot be easily avoided.
2. Use the `AskUserQuestion` tool to ask the user how they want to proceed. Offer options such as:
   - Proceed with the consumer-facing breaking changes (and note what downstream changes consumers will need)
   - Skip the upgrade entirely
   - Attempt an alternative approach (if one was identified)
3. Only proceed to Phase 2 once the user has explicitly approved the approach.

If the upgrade can be completed with **no consumer-facing breaking changes**, proceed directly to Phase 2.

---

## Phase 2: IMPLEMENTER (Code, Test & Iterate)

After passing the gates above, use the Task tool with `subagent_type: "general-purpose"` and `max_turns: 75` to run an **Implementer agent**. Pass it `WORKTREE` and the complete plan from Phase 1. The Implementer handles coding, testing, and fixing — all in a single agent context so it can react to test failures with full knowledge of what it changed and why.

### Step 1: Apply code changes

1. **Apply all code changes** identified in the plan:
   - Update API usage for breaking changes
   - Update type signatures if needed
   - Update configuration files if needed
   - Fix any imports that changed
   - **Do NOT change any public-facing APIs, exported types, or package interfaces** unless the user has explicitly approved consumer-facing breaking changes in the gate above
2. **Write a changeset file** at `.changeset/dependabot-<PR_NUMBER>.md` following the existing format in this repo. If this file already exists (from a previous run), overwrite it. The file should contain:
   - Frontmatter listing each affected package with bump type (`patch` for internal-only dependency updates, `minor` or `major` only if consumer-facing changes were approved)
   - A short description of the dependency update (e.g., "Updated `dependency-name` from v2 to v3")
   - If no packages in this monorepo are directly affected (e.g., a dev/CI-only dependency), use empty frontmatter (`---\n---`)
   - Look at existing `.changeset/dependabot-*.md` files for reference on the format

### Step 2: Local validation (fast feedback)

1. Run `pnpm install` to ensure dependencies resolve.
2. Run `pnpm build` (or whatever build command is used — check `package.json` scripts).
3. Run type checking if applicable (`pnpm typecheck` or `pnpm tsc`).
4. Run `pnpm lint` to catch linting issues.
5. Run `pnpm test` to run the test suite.
6. If any local checks fail, fix the issue and retry. This inner loop should be fast — no need to push for local-only failures.

### Step 3: Push and validate with real CI

Once local validation passes:

1. **Commit all changes** (including the changeset file) with a message like: `fix: apply breaking changes for <dep> v<version> upgrade`
2. **Push to the PR branch** (`git push origin HEAD`)
3. **Wait for CI** using `gh pr checks <PR_NUMBER> --watch --fail-level all`. Run this with a **10-minute Bash timeout** (`timeout: 600000`). If it times out before CI finishes, re-run the same command to continue waiting. Repeat until CI completes or fails.
4. **If CI passes**: Report success with a summary of all changes made.
5. **If CI fails**:
   - Fetch the failed run logs using `gh run view <run-id> --log-failed`
   - Analyze the failures
   - Fix the code
   - Commit with an appropriate message, push, and wait for CI again
   - **Repeat up to 3 total push+CI cycles.** After 3 failures, stop and report the remaining failures with your analysis.

Important: The Implementer should stick to the plan. If it discovers something unexpected, it should note it but still complete the planned changes. If tests reveal issues not covered in the plan, it should fix them using its own judgment while staying within the scope of the upgrade.

---

## Phase 3: QA REVIEWER (Final Review)

Once the Implementer reports success (CI passing), use the Task tool with `subagent_type: "general-purpose"` and `max_turns: 30` to run a **QA Reviewer agent**. Give it:
- `WORKTREE` so it can read files
- The original plan from Phase 1
- The list of all changes made by the Implementer
- The final CI results

The QA Reviewer should:

1. **Read every changed file** and verify the changes match the plan.
2. **Verify no unintended consumer-facing breaking changes** — check that no public APIs, exported types, or package interfaces were changed unless explicitly approved by the user. This is the highest priority check.
3. **Check for regressions** — did any changes inadvertently break something unrelated?
4. **Check for completeness** — were all breaking changes from the changelog addressed?
5. **Check code quality** — do the changes follow existing patterns in the codebase?
6. **Produce a final report**:
   - PASS/FAIL verdict
   - List of changes with assessment
   - Any concerns or follow-up items
   - Recommendation: ready to merge, needs manual review, or needs more work

---

## Final Output

After all phases complete (or if the upgrade was skipped/failed at a gate), present a summary. Use **exactly** this structured format so that batch tooling can parse the output:

```
## UPGRADE SUMMARY
- **Status**: COMPLETED | SKIPPED | FAILED
- **PR**: #<number>
- **Dependency**: <name> <old_version> → <new_version>
- **Risk**: high | medium | low
- **Consumer-facing breaking changes**: yes | no
- **Changeset written**: yes | no

### Breaking changes addressed
- <bullet list, or "None">

### Breaking changes requiring attention
- <bullet list, or "None">

### Consumer-facing breaking changes (if SKIPPED)
- <bullet list explaining what would break for consumers and why>

### Files modified
- <file path>: <brief description>

### Test results
- <pass/fail summary, or "Not run" if skipped>

### QA verdict
- <reviewer assessment, or "Not run" if skipped>

### Next steps
- <what the user should do>
```

**Status meanings:**
- **COMPLETED**: All phases ran, CI passes, QA approved. Ready for human review.
- **SKIPPED**: Stopped at the breaking change gate due to consumer-facing changes. No code changes were made. Requires human decision.
- **FAILED**: Attempted the upgrade but CI still fails after max iterations, merge conflicts could not be resolved, or an error occurred.

If anything needs manual attention, clearly call it out.

---

## Cleanup

After all phases complete (regardless of status), remove the worktree to free disk space:

```
git worktree remove /tmp/dependabot-upgrade-pr-<number>
git worktree prune
```

If the worktree removal fails (e.g., due to uncommitted changes), use `git worktree remove --force /tmp/dependabot-upgrade-pr-<number>`.
