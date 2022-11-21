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
  displayName: 'package',
  rootDir: '../../',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup-jest.ts'],
  automock: false,
};

export default config;
