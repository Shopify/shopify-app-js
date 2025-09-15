import type {Config} from 'jest';

import baseConfig from '../../../../config/tests/jest.config.ts';

const config: Config = {
  ...baseConfig,
  testTimeout: 80000,
};

export default config;
