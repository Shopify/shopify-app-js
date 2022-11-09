import type {Config} from 'jest';

import baseConfig from './base.jest.config';

const config: Config = {
  ...baseConfig,
  displayName: 'session_storage',
  rootDir: '../../session-storage',
  setupFilesAfterEnv: ['<rootDir>/../__tests__/setup-jest.ts'],
};

export default config;
