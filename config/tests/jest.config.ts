import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: [`${__dirname}/setup-jest.ts`],
};

export default config;
