const config = require('../../../.eslintrc');

module.exports = {
  ...config,
  ignorePatterns: [
    'docs/',
    '*.example.ts',
    '*.example.tsx',
    '*.example.*.ts',
    '*.example.*.tsx',
  ],
  env: {
    node: true,
  },
};
