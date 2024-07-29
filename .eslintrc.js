module.exports = {
  env: {
    browser: false,
    es2021: true,
  },
  extends: ['plugin:@shopify/typescript', 'plugin:@shopify/prettier'],
  ignorePatterns: ['build/', 'tmp/', 'dist/', 'coverage/', 'node_modules/'],
  rules: {
    'import/no-extraneous-dependencies': 0,
    'no-console': 0,
    '@typescript-eslint/naming-convention': 0,
    '@typescript-eslint/consistent-indexed-object-style': 0,
  },
  overrides: [
    {
      files: ['packages/apps/shopify-app-remix/src/__tests__/index.test.ts'],
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
