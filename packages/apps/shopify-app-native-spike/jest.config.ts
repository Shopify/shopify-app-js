/** @jest-config-loader ts-node */
import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  clearMocks: true,
  restoreMocks: true,
};

export default config;
