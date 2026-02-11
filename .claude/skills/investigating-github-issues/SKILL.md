---
name: investigating-github-issues
description: Investigates and analyzes GitHub issues for Shopify/shopify-app-js. Fetches issue details via gh CLI, searches for duplicates, examines the codebase for relevant context, applies version-based maintenance policy classification, and produces a structured investigation report. Use when a GitHub issue URL is provided, when asked to analyze or triage an issue, or when understanding issue context before starting work.
---

# Investigating GitHub Issues

Use the GitHub CLI (`gh`) for all GitHub interactions — fetching issues, searching, listing PRs, etc. Direct URL fetching may not work reliably.

## Early Exit Criteria

Before running the full process, check if you can stop early:
- **Clear duplicate**: If Step 3 finds an identical open issue with active discussion, stop after documenting the duplicate link.
- **Wrong repo**: If the issue clearly belongs to a different project, note it and stop.
- **Insufficient information**: If the issue has no reproducible details and no version info, skip to the report and recommend the author provide more context.

## Investigation Process

### Step 1: Fetch Issue Details

Retrieve the issue metadata:

```bash
gh issue view <issue-url> --json title,body,author,labels,comments,createdAt,updatedAt
```

Extract:
- Title and description
- Author and their context
- Existing labels and comments
- Timeline of the issue
- **Version information**: identify what version the issue is reported against
- **Package scoping**: identify which package(s) in the monorepo this issue affects (e.g., `packages/apps/shopify-app-remix`, `packages/api-clients/api-codegen-preset`). Scope all subsequent investigation to those packages.

### Step 2: Assess Version Status

Determine the current latest major version before going deeper — this drives the entire classification:

```bash
gh release list --limit 5
git tag -l | grep -E '^v?[0-9]+\.[0-9]+' | sort -V | tail -5
```

Compare the reported version against the latest major version and apply the version maintenance policy (see `references/version-maintenance-policy.md`).

Also check if the issue may already be fixed in a newer release:
- Review the CHANGELOG.md in the affected package(s)
- Compare the reported version against the latest published version for that package

### Step 3: Search for Similar Issues and Existing PRs

Search before deep code investigation to avoid redundant work:

```bash
gh issue list --search "keywords from issue" --limit 20
gh issue list --search "error message or specific terms" --state all
gh pr list --search "related terms" --state all
gh pr list --search "fixes #<issue-number>" --state all
```

- Look for duplicates (open and closed)
- Check if someone already has an open PR addressing this issue
- Check if this has been previously discussed or attempted
- Note previous solutions, workarounds, or explanations
- Always provide full GitHub URLs when referencing issues/PRs (e.g., `https://github.com/owner/repo/issues/123`)

### Step 4: Attempt Reproduction

Before diving into code, verify the reported behavior:
- Check if the described behavior matches what the current codebase would produce
- If the issue includes a code snippet or reproduction steps, trace through the relevant code paths
- If the issue references specific error messages, search for them in the codebase

This doesn't require running an app — code-level verification (reading the logic, tracing the flow) is sufficient.

### Step 5: Investigate Relevant Code

Based on the issue, similar issues found, and reproduction attempt, examine the codebase within the scoped package(s):
- Files and modules mentioned in the issue
- Related tests that provide context
- Recent commits in the affected area
- Code changes from similar resolved issues

### Step 6: Classify and Analyze

Apply version-based classification from `references/version-maintenance-policy.md`:
- Identify if the issue involves a technical limitation or architectural constraint
- For feature requests hitting technical limitations, assess the need for business case clarification

### Step 7: Produce the Investigation Report

Write the report following the template in `references/investigation-report-template.md`. Ensure every referenced issue and PR uses full GitHub URLs.

If a PR review is needed for a related PR, use the `reviewing-pull-requests` skill.
