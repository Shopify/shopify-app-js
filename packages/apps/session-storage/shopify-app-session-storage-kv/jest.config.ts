import type {Config} from 'jest';

import baseConfig from '../../../../config/tests/jest.config';

const config: Config = {
  ...baseConfig,
  testTimeout: 30000,
};

export default config;
