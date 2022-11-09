import type {Config} from 'jest';

const config: Config = {
  runner: 'jest-runner-eslint',
  displayName: 'lint',
  rootDir: '../../../',
  testMatch: ['<rootDir>/src/**/*.ts', '<rootDir>/session-storage/**/*.ts'],
  testPathIgnorePatterns: ['.*.d.ts'],
  watchPlugins: ['jest-runner-eslint/watch-fix'],
};

export default config;
