---
description: Prepare the changeset-release/main branch for release by syncing version.ts files and running pnpm install
allowed-tools: Read, Edit, Glob, Grep, Bash(git *), Bash(pnpm install*)
---

# Release Preparation Workflow

You are preparing the `changeset-release/main` branch for release.

---

## Step 1: Verify the current branch

Run `git branch --show-current` and confirm the current branch is `changeset-release/main`. If it is not, stop and tell the user they must be on `changeset-release/main` to run this workflow.

---

## Step 2: Identify which packages need version.ts updates

For each of the four packages below, read both the `package.json` version and the `version.ts` constant. If they differ, the file needs updating.

| Package                             | package.json                                          | version.ts                                                     | Constant name                          |
| ----------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------- |
| `@shopify/shopify-api`              | `packages/apps/shopify-api/package.json`              | `packages/apps/shopify-api/lib/version.ts`                     | `SHOPIFY_API_LIBRARY_VERSION`          |
| `@shopify/shopify-app-express`      | `packages/apps/shopify-app-express/package.json`      | `packages/apps/shopify-app-express/src/version.ts`             | `SHOPIFY_EXPRESS_LIBRARY_VERSION`      |
| `@shopify/shopify-app-remix`        | `packages/apps/shopify-app-remix/package.json`        | `packages/apps/shopify-app-remix/src/server/version.ts`        | `SHOPIFY_REMIX_LIBRARY_VERSION`        |
| `@shopify/shopify-app-react-router` | `packages/apps/shopify-app-react-router/package.json` | `packages/apps/shopify-app-react-router/src/server/version.ts` | `SHOPIFY_REACT_ROUTER_LIBRARY_VERSION` |

Read all 8 files in parallel.

---

## Step 3: Update version.ts files

For each package where the `package.json` version does not match the `version.ts` constant:

1. Use the Edit tool to update the constant to match the `package.json` version.
2. Report what you changed (e.g., "`SHOPIFY_API_LIBRARY_VERSION` updated from `12.2.0` to `12.3.0`").

If all version.ts files already match their `package.json` versions, note that no updates were needed.

---

## Step 4: Run pnpm install

Run `pnpm install` from the repo root to update the lock file.

---

## Step 5: Summary

Print a summary of:

- Which version.ts files were updated (with old → new versions)
- Which packages had no changes needed
- That `pnpm install` was run

Remind the user that the next steps are:

1. Commit any changes that were just made.
2. Review and edit the `CHANGELOG.md` files if needed, then commit any changes to `changeset-release/main`.
3. Merge the `Packages for release` PR into `main` to trigger the release.
