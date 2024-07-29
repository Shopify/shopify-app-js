# Contributing

We welcome your contributions to the project. There are a few steps to take when looking to make a contribution.

- Open an issue to discuss the feature/bug
- If feature/bug is deemed valid then fork repo.
- Implement patch to resolve issue.
- Include tests to prevent regressions and validate the patch.
- Update the docs for any API changes.
- Submit a pull request.

## Bug Reporting

Shopify App Express package for Node uses GitHub issue tracking to manage bugs, please open an issue there.

## Feature Request

You can open a new issue on the GitHub issues and describe the feature you would like to see.

## Developing the package

Requirements:

- [Node](https://nodejs.org/en/) v14 or above
- [Yarn](https://yarnpkg.com/) v1.22 or above

You can set up your development environment by running the following:

```shell
git clone git@github.com:Shopify/shopify-app-js.git # get the code
cd shopify-app-js                                   # change into the source directory
yarn install                                        # install dependencies
yarn build                                          # build package
```

Helpful commands

- `yarn lint` will run linting to make sure your code is of high standard
- `yarn test` will run testing to ensure your code is covered by test cases
