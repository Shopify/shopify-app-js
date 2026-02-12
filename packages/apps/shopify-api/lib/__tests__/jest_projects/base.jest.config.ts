import type {Config} from 'jest';

const config: Config = {
  // or other ESM presets
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  watchPathIgnorePatterns: ['./node_modules'],
  testRegex: '.*\\.test\\.tsx?$',
  coverageDirectory: './coverage/',
  collectCoverage: false,
  // jose v6 is ESM-only; allow jest to transform it
  transformIgnorePatterns: ['/node_modules/(?!jose)'],
};

export default config;
