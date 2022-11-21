import type {Config} from 'jest';

const projects = [
  './src/__tests__/jest_projects/eslint.jest.config.ts',
  './src/__tests__/jest_projects/session-storage.jest.config.ts',
];

const config: Config = {
  projects,
  testTimeout: 5000,
  passWithNoTests: true,
  watchPlugins: ['jest-runner-eslint/watch-fix'],
};

export default config;
