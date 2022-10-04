import type {Config} from 'jest';

const projects = [
  './src/__tests__/jest_projects/package.jest.config.ts',
  './src/__tests__/jest_projects/eslint.jest.config.ts',
];

const config: Config = {
  testTimeout: 30000,
  projects,
};

export default config;
