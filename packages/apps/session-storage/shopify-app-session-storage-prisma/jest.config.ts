import type {Config} from 'jest';

import baseConfig from '../../../../config/tests/jest.config.ts';

const config: Config = {
  ...baseConfig,
  testTimeout: 30000,
};

export default config;
