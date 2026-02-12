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
  // jose v6 is ESM-only; transform it so Jest (CJS mode) can load it
  transformIgnorePatterns: ['/node_modules/(?!jose)'],
  transform: {
    '^.+\\.m?tsx?$': ['ts-jest', {useESM: true}],
    // Transform jose's ESM .js files so Jest can load them
    '.+/node_modules/jose/.+\\.js$': ['ts-jest', {useESM: true}],
  },
};

export default config;
