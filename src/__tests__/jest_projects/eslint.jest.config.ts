import type {Config} from 'jest';

const config: Config = {
  runner: 'jest-runner-eslint',
  displayName: 'lint',
  rootDir: '../../',
  testMatch: ['<rootDir>/**/*.ts', '<rootDir>/**/*.js'],
  watchPlugins: ['jest-runner-eslint/watch-fix'],
};

export default config;
