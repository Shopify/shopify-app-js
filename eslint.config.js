const shopifyPlugin = require('@shopify/eslint-plugin');

module.exports = [
  // Core configs
  ...shopifyPlugin.configs.typescript,
  ...shopifyPlugin.configs.prettier,

  // Global ignores (replaces .eslintignore and ignorePatterns)
  {
    ignores: [
      '**/build/',
      '**/tmp/',
      '**/dist/',
      '**/coverage/',
      '**/node_modules/',
      '**/rollup.config.js',
      '**/rollup.config.*.js',
      '**/rollup.config.cjs',
      '**/.eslintrc.cjs',
      '**/babel.config.js',
      'packages/apps/shopify-api/rest/admin/',
      // .mjs test helper scripts (not part of the library, never linted before)
      '**/*.mjs',
      // Remix and React Router example/doc files
      'packages/apps/shopify-app-remix/docs/',
      'packages/apps/shopify-app-remix/**/*.example.ts',
      'packages/apps/shopify-app-remix/**/*.example.tsx',
      'packages/apps/shopify-app-remix/**/*.example.*.ts',
      'packages/apps/shopify-app-remix/**/*.example.*.tsx',
      'packages/apps/shopify-app-react-router/docs/',
      'packages/apps/shopify-app-react-router/**/*.example.ts',
      'packages/apps/shopify-app-react-router/**/*.example.tsx',
      'packages/apps/shopify-app-react-router/**/*.example.*.ts',
      'packages/apps/shopify-app-react-router/**/*.example.*.tsx',
    ],
  },

  // Global rule overrides
  {
    rules: {
      'import/no-extraneous-dependencies': 'off',
      'no-console': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
    },
  },

  // TypeScript-specific rule overrides (scoped to .ts/.tsx files)
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-empty-object-type': [
        'error',
        {allowInterfaces: 'with-single-extends'},
      ],
    },
  },

  // Remix: prevent cross-imports between react and server directories
  {
    files: ['packages/apps/shopify-app-remix/src/react/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../server/*'],
              message:
                'Importing from src/react in src/server is not allowed as they must be kept separate, because it breaks Remix bundling.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/apps/shopify-app-remix/src/server/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../react/*'],
              message:
                'Importing from src/react in src/server is not allowed as they must be kept separate, because it breaks Remix bundling.',
            },
          ],
        },
      ],
    },
  },

  // React Router: prevent cross-imports between react and server directories
  {
    files: ['packages/apps/shopify-app-react-router/src/react/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../server/*'],
              message:
                'Importing from src/react in src/server is not allowed as they must be kept separate, because it breaks Remix bundling.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/apps/shopify-app-react-router/src/server/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../react/*'],
              message:
                'Importing from src/react in src/server is not allowed as they must be kept separate, because it breaks Remix bundling.',
            },
          ],
        },
      ],
    },
  },
];
