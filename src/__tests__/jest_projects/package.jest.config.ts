import type {Config} from 'jest';

import baseConfig from './base.jest.config';

const config: Config = {
  ...baseConfig,
  displayName: 'package',
  rootDir: '../../',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup-jest.ts'],
  automock: false,
};

export default config;
