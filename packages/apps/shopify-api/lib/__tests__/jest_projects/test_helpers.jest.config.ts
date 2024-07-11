import type {Config} from 'jest';

import baseConfig from './base.jest.config';

const config: Config = {
  ...baseConfig,
  displayName: 'test_helpers',
  rootDir: '../../../test-helpers',
  setupFilesAfterEnv: ['<rootDir>/../lib/setup-jest.ts'],
};

export default config;
