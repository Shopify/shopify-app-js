---
name: reviewing-pull-requests
description: Reviews pull requests for Shopify/shopify-app-js with comprehensive analysis including semver compliance (MAJOR/MINOR/PATCH classification), single responsibility validation, pattern consistency checks against established TypeScript/Node.js library patterns, and root cause analysis. Produces a structured review with breaking changes assessment, improvement suggestions, and community contribution guidance. Use when asked to review a PR, check for breaking changes, or validate code quality.
---

# Reviewing Pull Requests

Use the GitHub CLI (`gh`) for all GitHub interactions — fetching PRs, diffs, checks, etc. Direct URL fetching may not work reliably.

## Monorepo Structure

shopify-app-js is a monorepo. Key package locations:
- `packages/api-clients/*` — API client libraries
- `packages/apps/*` — App framework packages

Keep this structure in mind when checking pattern consistency across packages.

## Early Exit Criteria

Before running the full process, check if you can stop early:
- **CI failing**: If `gh pr checks` shows failures on non-flaky tests, note the failures and defer detailed review until CI is green.
- **Draft PR**: If the PR is in draft state, provide directional feedback on the approach rather than detailed line-by-line review. Focus on architecture, solution direction, and potential blockers.

## Triage: Detect Automated PRs

After fetching PR metadata, check if this is from Dependabot, Renovate, or another bot:

```bash
gh pr view <PR_NUMBER> --json author,labels
```

**For automated dependency PRs**, apply a simplified review:
1. Check CI status (`gh pr checks <PR_NUMBER>`)
2. Review the dependency changelog for breaking changes
3. Verify compatibility with supported Node.js versions
4. Check for security advisories related to the update
5. Skip single-responsibility analysis, root cause analysis, and pattern consistency checks

For all other PRs, continue with the full review below.

## Initial Analysis

Emit brief progress markers as you work (e.g., "Fetching PR metadata...", "Analyzing diff...", "Checking pattern consistency..."). Present the final review as a single structured block.

Systematically gather information before reviewing:

1. Fetch PR metadata:
   ```bash
   gh pr view <PR_NUMBER> --json number,title,body,state,isDraft,author,createdAt,updatedAt,files,additions,deletions,baseRefName,headRefName,mergeable,commits,labels | cat
   ```
2. Check CI status:
   ```bash
   gh pr checks <PR_NUMBER>
   ```
3. Get the diff:
   ```bash
   gh pr diff <PR_NUMBER>
   ```
4. For any issue references in the PR body (e.g., #123, fixes #456), fetch each:
   ```bash
   gh issue view <number> --json number,title,body,state,author,createdAt,updatedAt | cat
   ```
   If deeper issue context is needed, use the `investigating-github-issues` skill.
5. Search for existing patterns in the codebase — find similar code, check if similar functionality already exists, look for existing test patterns for similar features.
6. Verify the problem being solved — check if the issue actually exists, whether the solution addresses the root cause, and if there are existing solutions in the codebase.

## Monorepo Scope Assessment

Determine the blast radius of the PR:
- Which packages does this PR touch? List them.
- Does it cross package boundaries? Cross-package PRs deserve extra scrutiny for coordination issues.
- For changes to shared types or utilities that other packages depend on, trace the dependency chain to identify all affected consumers.
- Are changes to re-exported APIs consistent across the source and re-exporting packages?

## Version Maintenance Check

Apply the version maintenance policy (see `../shared/references/version-maintenance-policy.md`):
- Is this PR targeting a maintained version/branch?
- If the PR fixes a bug in an unmaintained major version, flag it — the fix should target the latest major version instead.

## Solution Validation

Before diving into code review, critically evaluate:
- **Right solution?** Could the same goal be achieved by modifying existing code instead of adding new code?
- **Right location?** Should this functionality be in an existing module rather than a new one?
- **All areas covered?** What other parts of the codebase might need similar changes?
- **Problem verified?** Set up a reproduction to verify the issue exists and that the PR fixes it.

## Critical Thinking Requirements

1. **Question PR descriptions** — don't assume the description accurately describes what the code does
2. **Verify claims** — if a PR claims certain files need changes, verify each one actually needs them
3. **Look for existing solutions** — before accepting new code, check if existing code could be extended
4. **Test edge cases** — consider behavior in different scenarios (development/production, embedded/non-embedded)
5. **Challenge scope** — if changes seem too broad, investigate if fewer changes would suffice

## Pattern Discovery Protocol

When reviewing structural changes:
1. Map the inheritance chain of affected classes
2. Identify all included modules and their effects
3. Trace through the actual code execution path
4. Identify which methods are actually called and when
5. Check for test coverage that would catch issues

## Core Review Checks

### Changeset Verification
Check if the PR includes a changeset file (typically in `.changeset/` directory):
- Does a changeset exist for this PR? If the PR modifies package behavior, one should be present.
- Does the changeset's bump level (major/minor/patch) match your semver classification?
- Does the changeset description accurately summarize the change for end users?
- If no changeset exists and one is needed, flag it.

### Single Responsibility Validation
Evaluate whether the PR changes only one logical unit of work:
- Are all changes related to the stated purpose?
- Do the changes address a single issue or feature?
- Are there opportunistic fixes unrelated to the main change?

Multiple unrelated changes → recommend splitting the PR.

### Semver Compliance Analysis
Classify the change as MAJOR, MINOR, or PATCH. See `references/semver-classification.md` for detailed rules.

### Pattern Consistency Enforcement
Verify alignment with established library patterns. When checking a pattern, find a canonical example in the same package to compare against:
- **Code Organization**: file structure follows existing module patterns
- **Naming Conventions**: functions, variables, and files match existing style
- **Error Handling**: consistent error types and handling strategies
- **Testing Patterns**: test structure and coverage match existing tests
- **Documentation Style**: JSDoc comments and inline documentation consistency
- **TypeScript Patterns**: type definitions, interfaces, and generic usage
- **Module Exports**: consistent export patterns (named vs default)
- **Async Patterns**: promise handling and async/await usage

## Special Analysis Checklist

- **TypeScript changes**: verify all type exports are properly maintained, no type information is lost
- **API changes**: check if README.md or API docs need updating
- **Dependency changes**: assess security implications and compatibility with supported Node.js versions
- **Test changes**: ensure coverage is maintained or improved, never decreased
- **Configuration changes**: verify backward compatibility and migration paths
- **Cross-package changes**: verify consistency across all affected packages and their consumers

## Produce the Review

Write the review following the template in `references/review-output-template.md`.
