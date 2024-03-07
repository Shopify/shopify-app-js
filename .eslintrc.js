module.exports = {
  env: {
    browser: false,
    es2021: true,
  },
  extends: ['plugin:@shopify/typescript', 'plugin:@shopify/prettier'],
  ignorePatterns: ['build/', 'tmp/', 'dist/', 'coverage/', 'node_modules/'],
  rules: {
    'no-console': 0,
    '@typescript-eslint/naming-convention': 0,
  },
  overrides: [
    {
      files: [
        '**/setup-jest.ts',
        '**/rollup.config.js',
        '**/rollup.config.*.js',
        'packages/shopify-app-express/src/__tests__/test-helper.ts',
      ],
      rules: {
        'import/no-extraneous-dependencies': 0,
      },
    },
    {
      files: ['packages/shopify-app-remix/src/__tests__/index.test.ts'],
      rules: {
        '@babel/no-unused-expressions': 0,
      },
    },
    {
      files: ['**/.eslintrc.js'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
};
