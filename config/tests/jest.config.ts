import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: [`${__dirname}/setup-jest.ts`],
  verbose: false,
  // jose v6 is ESM-only; transform it to CJS for jest and polyfill Web Crypto
  transformIgnorePatterns: ['/node_modules/(?!jose)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
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
  setupFiles: [`${__dirname}/setup-crypto.ts`],
};

export default config;
