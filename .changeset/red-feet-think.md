---
'@shopify/api-codegen-preset': minor
---

Updated dependency on `@shopify/graphql-codegen`, which can now output regular .ts files in addition to .d.ts files, which will allow apps to import enums from the `.types.ts` file in their code.

If you're using `shopifyApiProject` or `shopifyApiTypes`, you can pass in a new `declarations` setting, which defaults to true to maintain the previous behaviour:

```diff
// For shopifyApiProject
export default {
  ...
  projects: {
    default: shopifyApiProject({
      apiType: ApiType.Admin,
      apiVersion: '2023-10',
      documents: ['./app/**/*.{js,ts,jsx,tsx}'],
      outputDir: './app/types',
+     declarations: false,
    }),
  },
};

// For shopifyApiTypes
export default {
  ...
  projects: {
    // To produce variable / return types for Admin API operations
    schema: 'https://shopify.dev/admin-graphql-direct-proxy/2023-10',
    documents: ['./app/**/*.{js,ts,jsx,tsx}'],
    extensions: {
      codegen: {
        pluckConfig,
        generates: shopifyApiTypes({
          apiType: ApiType.Admin,
          apiVersion: '2023-10',
          documents: ['./app/**/*.{js,ts,jsx,tsx}'],
          outputDir: './app/types',
+         declarations: false,
        }),
      },
    },
  },
};
```

If you're using the preset directly, you just need to change your output files to `.ts`:

```diff
export default {
  ...
  projects: {
    default: {
      schema: 'https://shopify.dev/admin-graphql-direct-proxy',
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
-           './types/admin.types.d.ts': {
+           './types/admin.types.ts': {
              plugins: ['typescript'],
            },
-           './types/admin.generated.d.ts': {
+           './types/admin.generated.ts': {
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
