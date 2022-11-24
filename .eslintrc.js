module.exports = {
  env: {
    browser: false,
    es2021: true,
  },
  extends: ['plugin:@shopify/typescript', 'plugin:@shopify/prettier'],
  ignorePatterns: ['build/', 'tmp/'],
  rules: {
    'import/no-named-as-default': 0,
    'no-mixed-operators': 0,
    'no-console': 0,
    'lines-around-comment': 0,
    'import/no-cycle': 0,
    '@typescript-eslint/naming-convention': 0,
  },
  overrides: [
    {
      files: ['packages/*/loom.config.ts', 'tests/setup/setup-jest.ts'],
      rules: {
        'import/no-extraneous-dependencies': 0,
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
