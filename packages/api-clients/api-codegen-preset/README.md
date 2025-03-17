# `@shopify/api-codegen-preset`

<!-- ![Build Status]() -->

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](../../../LICENSE.md)
[![npm version](https://badge.fury.io/js/@shopify%2Fapi-codegen-preset.svg)](https://badge.fury.io/js/@shopify%2Fapi-codegen-preset)

This package enables JavaScript / TypeScript apps to use a `#graphql` tag to parse queries with [`graphql-codegen`](https://the-guild.dev/graphql/codegen).

It produces TypeScript types for every query picked up by your codegen configuration.
Shopify's clients are then able to use those types to automatically type your operation's variables and return types.

## Getting started

The first step is to install the `@shopify/api-codegen-preset` package, using your preferred package manager:

```sh
yarn add --dev @shopify/api-codegen-preset
```

```sh
npm add --save-dev @shopify/api-codegen-preset
```

```sh
pnpm add -D @shopify/api-codegen-preset
```

## Configuration

This package provides 3 key exports, that make it increasingly easier to set up a project:

1. `preset`: provides the low-level implementation that converts the schema into types. Include this in a `generates` step.
1. `shopifyApiTypes`: provides all the [`generates`](https://the-guild.dev/graphql/codegen/docs/config-reference/codegen-config#configuration-options) steps needed for a project.
1. `shopifyApiProject`: one-stop-shop setup for an entire codegen project.

### `preset`

Use this as [a Codegen preset](https://the-guild.dev/graphql/codegen/docs/config-reference/codegen-config#configuration-options) inside a `generates` step.
This gives you complete control over your configuration if you want to set up a fully custom scenario.

| Option  | Type      | Default              | Description                                                                                                                          |
| ------- | --------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| apiType | `ApiType` | _N/A_                | The API to pull schemas from.                                                                                                        |
| module  | `string?` | Depends on `ApiType` | Change the module whose types will be overridden. Use this to override the types for any package, as long as it uses the same names. |

> [!TIP]
> You can also set your codegen configuration to output `.ts` files, instead of `.d.ts`.
> That may slightly increase build sizes, but it enables you to import enums from the schema in your app code.

#### Example `.graphqlrc.ts` file

```ts
import {ApiType, pluckConfig, preset} from '@shopify/api-codegen-preset';

export default {
  // For syntax highlighting / auto-complete when writing operations
  schema: 'https://shopify.dev/admin-graphql-direct-proxy/2025-01',
  documents: ['./**/*.{js,ts,jsx,tsx}'],
  projects: {
    default: {
      // For type extraction
      schema: 'https://shopify.dev/admin-graphql-direct-proxy/2025-01',
      documents: ['./**/*.{js,ts,jsx,tsx}'],
      extensions: {
        codegen: {
          // Enables support for `#graphql` tags, as well as `/* GraphQL */`
          pluckConfig,
          generates: {
            './types/admin.schema.json': {
              plugins: ['introspection'],
              config: {minify: true},
            },
            './types/admin.types.d.ts': {
              plugins: ['typescript'],
            },
            './types/admin.generated.d.ts': {
              preset,
              presetConfig: {
                apiType: ApiType.Admin,
              },
            },
          },
        },
      },
    },
  },
};
```

### `shopifyApiTypes`

This function creates the appropriate `generates` steps for a project.
Use this function if you want to configure a custom project, or add your own `generates` steps.

| Option       | Type        | Default              | Description                                                                                                                                                        |
| ------------ | ----------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| apiType      | `ApiType`   | _N/A_                | The API to pull schemas from.                                                                                                                                      |
| apiVersion   | `string?`   | Oldest stable version| Pull schemas for a specific version.                                                                                                                               |
| apiKey       | `string?`   | _N/A_                | The app's API key. This can be found in the app's page in Shopify Partners in the "Authentication" section. Required and only valid for the customer API preset and helpers for now   |
| outputDir    | `string?`   | `.`                  | Where to output the types files.                                                                                                                                   |
| documents    | `string[]?` | `./**/*.{ts,tsx}`    | Glob pattern for files to parse.                                                                                                                                   |
| module       | `string?`   | Depends on `ApiType` | Change the module whose types will be overridden. Use this to override the types for any package, as long as it uses the same names.                               |
| declarations | `boolean?`  | `true`               | When true, create declaration (`.d.ts`) files with the types. When false, creates `.ts` files that can be imported in app code. May slightly increase build sizes. |

#### Example `.graphqlrc.ts` file

```js
import {
  ApiType,
  pluckConfig,
  shopifyApiTypes,
} from '@shopify/api-codegen-preset';

export default {
  // For syntax highlighting / auto-complete when writing operations
  schema: 'https://shopify.dev/admin-graphql-direct-proxy/2025-01',
  documents: ['./app/**/*.{js,ts,jsx,tsx}'],
  projects: {
    // To produce variable / return types for Admin API operations
    schema: 'https://shopify.dev/admin-graphql-direct-proxy/2025-01',
    documents: ['./app/**/*.{js,ts,jsx,tsx}'],
    extensions: {
      codegen: {
        pluckConfig,
        generates: shopifyApiTypes({
          apiType: ApiType.Admin,
          apiVersion: '2025-01',
          documents: ['./app/**/*.{js,ts,jsx,tsx}'],
          outputDir: './app/types',
        }),
      },
    },
  },
};
```

### `shopifyApiProject`

This function creates a fully-functional project configuration.

| Option       | Type        | Default              | Description                                                                                                                                                        |
| ------------ | ----------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| apiType      | `ApiType`   | _N/A_                | The API to pull schemas from.                                                                                                                                      |
| apiVersion   | `string?`   | Oldest stable version | Pull schemas for a specific version.                                                                                                                               |
| outputDir    | `string?`   | `.`                  | Where to output the types files.                                                                                                                                   |
| documents    | `string[]?` | `./**/*.{ts,tsx}`    | Glob pattern for files to parse.                                                                                                                                   |
| module       | `string?`   | Depends on `ApiType` | Change the module whose types will be overridden. Use this to override the types for any package, as long as it uses the same names.                               |
| declarations | `boolean?`  | `true`               | When true, create declaration (`.d.ts`) files with the types. When false, creates `.ts` files that can be imported in app code. May slightly increase build sizes. |

#### Example `.graphqlrc.ts` file

```js
import {shopifyApiProject, ApiType} from '@shopify/api-codegen-preset';

export default {
  // For syntax highlighting / auto-complete when writing operations
  schema: 'https://shopify.dev/admin-graphql-direct-proxy/2025-01',
  documents: ['./app/**/*.{js,ts,jsx,tsx}'],
  projects: {
    // To produce variable / return types for Admin API operations
    default: shopifyApiProject({
      apiType: ApiType.Admin,
      apiVersion: '2025-01',
      documents: ['./app/**/*.{js,ts,jsx,tsx}'],
      outputDir: './app/types',
    }),
  },
};
```

#### Example `.graphqlrc.ts` file with to generate types for UI extensions
You can specify multiple APIs in your `.graphqlrc.ts` file by adding multiple projects.

```js
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApiProject, ApiType } from "@shopify/api-codegen-preset";
import type { IGraphQLConfig } from "graphql-config";

function getConfig() {
  const config: IGraphQLConfig = {
    projects: {
      default: shopifyApiProject({
        apiType: ApiType.Storefront,
        apiVersion: LATEST_API_VERSION,
        documents: ["./extensions/**/*.{js,ts,jsx,tsx}", "./extensions/.server/**/*.{js,ts,jsx,tsx}"],
        outputDir: "./extensions/types",
      }),
      UIExtensions: shopifyApiProject({
        apiType: ApiType.Admin,
        apiVersion: LATEST_API_VERSION,
        documents: ["./app/**/*.{js,ts,jsx,tsx}", "./app/.server/**/*.{js,ts,jsx,tsx}" ],
        outputDir: "./app/types",
      }),
    },
  };

const config = getConfig();
export default config;
```


### Example `graphqlrc.ts` file for autocompletion for Shopify Function Extensions
```ts
import fs from "fs";
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApiProject, ApiType } from "@shopify/api-codegen-preset";
import type { IGraphQLConfig } from "graphql-config";

function getConfig() {
  const config: IGraphQLConfig = {
    projects: {
      default: shopifyApiProject({
        apiType: ApiType.Storefront,
        apiVersion: LATEST_API_VERSION,
        documents: ["./extensions/**/*.{js,ts,jsx,tsx}", "./extensions/.server/**/*.{js,ts,jsx,tsx}"],
        outputDir: "./extensions/types",
      }),
  };

  let extensions: string[] = [];
  try {
    extensions = fs.readdirSync("./extensions");
    console.log(extensions, "extensions");
  } catch {
    // ignore if no extensions
  }

  for (const entry of extensions) {
    console.log(entry, "entry");
    const extensionPath = `./extensions/${entry}`;
    const schema = `${extensionPath}/schema.graphql`;
    if (!fs.existsSync(schema)) {
      continue;
    }
    config.projects[entry] = {
      schema,
      documents: [`${extensionPath}/**/*.graphql`],
    };
  }


  return config;
}

const config = getConfig();
export default config;
```

## Generating types

Once you configure your app, you can run `graphql-codegen` to start parsing your queries for types.

To do that, add this `script` to your `package.json` file:

```json
{
  "scripts": {
    // ...
    "graphql-codegen": "graphql-codegen"
  }
}
```

You can then run the script using your package manager:

```sh
yarn graphql-codegen
```

```sh
npm run graphql-codegen
```

```sh
pnpm graphql-codegen
```

### Generating types for more than one API
If you have specified more than one API in your `.graphqlrc.ts` file, you can run the script for each API by passing the `--project` [flag](https://the-guild.dev/graphql/codegen/docs/config-reference/multiproject-config#command-to-generate-files).

```sh
npm run graphql-codegen --project=UIExtensions
```

```sh
yarn graphql-codegen --project=UIExtensions
```

```sh
pnpm graphql-codegen --project=UIExtensions
```

> [!NOTE]
> Codegen will fail if it can't find any documents to parse.
> To fix that, either create a query or set the [`ignoreNoDocuments` option](https://the-guild.dev/graphql/codegen/docs/config-reference/codegen-config#configuration-options) to `true`.
> Queries and mutations must have a name for the parsing to work.

Once the script parses your operations, you can mark any operations for parsing by adding the `#graphql` tag to the string.
For example:

```ts
import '../types/admin.generated.d.ts';

const response = await myGraphqlClient.graphql(
  `#graphql
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          handle
        }
      }
    }
  }`,
  {
    variables: {
      first: 1,
    } as GetProductsQueryVariables,
  },
);

const data: GetProductsQuery = response.data;
```

You'll note that once the script parses this query, the `admin.generated.d.ts` file will start including a new `GetProductsQuery` type that maps to your query.

You can commit these types to your repository, so that you don't have to re-run the parsing script every time.

To make your development flow faster, you can pass in the `--watch` flag to update the query types whenever you save a file:

```sh
npm run graphql-codegen -- --watch
```
