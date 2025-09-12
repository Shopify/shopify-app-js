import type {Config} from 'jest';

const config: Config = {
  runner: 'jest-runner-eslint',
  displayName: 'lint',
  rootDir: '../../../',
  testMatch: ['<rootDir>/**/*.ts'],
  modulePathIgnorePatterns: ['<rootDir>/rest/admin/'],
  testPathIgnorePatterns: ['.*.d.ts'],
};

export default config;
