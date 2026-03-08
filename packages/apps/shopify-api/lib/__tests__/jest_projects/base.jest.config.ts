import path from 'path';

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
  // jose v6 is ESM-only; transform it to CJS for jest and polyfill Web Crypto
  transformIgnorePatterns: ['/node_modules/(?!jose)'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {useESM: true, tsconfig: {module: 'CommonJS'}}],
    '^.+\\.js$': [
      'ts-jest',
      {
        useESM: false,
        tsconfig: {
          allowJs: true,
          esModuleInterop: true,
          module: 'CommonJS',
        },
      },
    ],
  },
  setupFiles: [path.resolve(__dirname, '../setup-crypto.ts')],
};

export default config;
