import type {Config} from 'jest';

const config: Config = {
  runner: 'jest-runner-eslint',
  displayName: 'lint',
  testMatch: ['<rootDir>/**/*.ts'],
  testPathIgnorePatterns: ['.*.d.ts'],
  rootDir: '../../',
};

export default config;
