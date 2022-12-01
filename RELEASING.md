# Releasing shopify-app-js packages

1. The `shopify-app-js` repo uses `changesets` to track and update the respective `CHANGELOG.md` files within the packages.

1. When creating a PR, the author should run the `yarn changeset` command, answer the relevant questions (i.e., what packages does this PR update, is it major/minor/patch, what is the change description), and then commit the new file created in the `.changeset` directory. These files are used by the workflows to construct the `CHANGELOG.md` entries.

   > **Note**
   > If the change is very small and doesn't warrant a changelog entry, run `yarn changeset --empty` and commit the resultant file in the `.changeset` directory.

1. When the PR is merged into the `main` branch, the `main-release.yml` workflow uses the `changesets/action` to either create or update an existing PR that has the title `Version Packages`. This PR tracks all the changes currently being made against the `main` branch since the last release.

1. To perform a release, check the details of the `Version Packages` PR, and merge it into `main`.

1. The same `changesets/action` in the `main-release.yml` workflow will call `yarn release`, which builds and pushes the changes to `npmjs.org`.

## Release Candidates

For significant changes that could result in significant refactoring on the part of developers, consider releasing a few _Release Candidate_ versions in advance of the final version.

> **Note**
> These changes **must** be made against the `next` branch, so that the appropriate workflows can run (`next-release.yml`).

1. Prior to creating PR, run the `yarn changeset pre enter rc` command and commit the resultant files from `.changeset`, including the `pre.json` file. This informs `changesets` that it is in pre-release mode, and the pre-release tag is `rc`.

1. When creating a PR, the author should run the `yarn changeset` command, answer the relevant questions (i.e., what packages does this PR update, is it major/minor/patch, what is the change description), and then commit the new file created in the `.changeset` directory. These files are used by the workflows to construct the `CHANGELOG.md` entries for the release candidates.

   > **Note**
   > If the change is very small and doesn't warrant a changelog entry, run `yarn changeset --empty` and commit the resultant file in the `.changeset` directory.

1. When the PR is merged into the `next` branch, the `next-release.yml` workflow uses the `changesets/action` to either create or update an existing PR that has the title `Version Packages for Release Candidates`.

1. To perform a release of release candidates, check the details of the `Version Packages for Release Candidates` PR, and merge it into `next`.

1. The same `changesets/action` in the `next-release.yml` workflow will call `yarn release`, which builds and pushes the changes to `npmjs.org`.

## Merging `next` into `main` (moving from pre-release to main release)

When a major set of changes is about to be mass released from the `next` branch

> **Warning**
> The next steps need to be confirmed

1. Take the `next` branch out of pre-release mode by running

   ```shell
   yarn changeset pre exit
   ```

   And commit the changed files.

1. Merge the `next` branch into `main`. This _should_ update the relevant `CHANGELOG.md` files on `main` with the changes from the release candidates.

1. In the resultant `Version Packages` PR, edit the `CHANGELOG.md` files as needed, as many of the entries may be irrelevant (early release candidate comments no longer applicable) or may be combined.

1. Merge the `Version Packages` PR into `main` - this will trigger the build and push to `npmjs.org` of the new packages.
