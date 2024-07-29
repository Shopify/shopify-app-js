import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: [`${__dirname}/setup-jest.ts`],
  verbose: false,
};

export default config;
