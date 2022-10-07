import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  watchPathIgnorePatterns: ['./node_modules'],
  testRegex: '.*\\.test\\.tsx?$',
  testTimeout: 5000,
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup-jest.ts'],
};

export default config;
