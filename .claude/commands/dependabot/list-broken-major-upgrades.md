---
description: List open Dependabot PRs with major version bumps where CI is failing
model: opus
allowed-tools: Bash(gh *)
---

# List Major Dependabot PRs — CI Failing

Find and present all open Dependabot PRs in this repository that involve **major version bumps** and have **failing CI checks**.

## Steps

1. **Fetch all open Dependabot PRs** with their CI status:
   ```
   gh pr list --author "app/dependabot" --state open --json number,title,url,statusCheckRollup,createdAt --limit 100
   ```

2. **Identify major version bumps** by analyzing each PR title:
   - Look for patterns like `from X.Y.Z to A.B.C` where the major version (first number) has changed (e.g., `5.1.1` to `6.1.0` is major, `3.6.2` to `3.8.1` is not)
   - For grouped dependency PRs without explicit versions in the title (e.g., "bump the X group with N updates", "bump express and @types/express"), fetch the PR body with `gh pr view <number> --json body` and look for version information there. Dependabot always lists the version changes in the body.
   - A PR is a "major bump" if any dependency in it has a different major version number between old and new

3. **Check CI status** for each major bump PR:
   - From `statusCheckRollup`, look at checks from the **"CI" workflowName** only (these have names like `Lint`, `Test_ApiClients_*`, `Test_App_Packages_*`, `Test_Session_Storage_*`)
   - **Ignore** checks from other workflows: `Changelog`, `Contributor License Agreement (CLA)`, `Dependabot auto-merge` — these commonly fail or are skipped on Dependabot PRs and are not relevant to CI health
   - CI is "passing" if every CI workflow check has `conclusion` of `SUCCESS` or `SKIPPED`
   - CI is "failing" if any CI workflow check has `conclusion` of `FAILURE`

4. **Present the results** as a markdown table:
   ```
   ## Major Dependabot PRs — CI Failing

   | PR | Dependency | Version Change | Failing Checks | Age | URL |
   |----|-----------|---------------|----------------|-----|-----|
   | #2976 | jose | 5.10.0 → 6.1.3 | Test_App_Packages, Test_Session_Storage | 21 days | https://github.com/Shopify/shopify-app-js/pull/2976 |

   Copy a URL and run: `/dependabot:fix-broken-major-upgrade <url>`
   ```

5. **Summary line** at the end:
   ```
   Found X major Dependabot PRs with failing CI (out of N total open Dependabot PRs)
   ```

6. If **no PRs match**, say so and report how many total Dependabot PRs are open.
