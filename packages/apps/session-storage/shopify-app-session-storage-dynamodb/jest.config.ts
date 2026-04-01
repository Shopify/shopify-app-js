/** @jest-config-loader ts-node */
import type {Config} from 'jest';

import baseConfig from '../../../../config/tests/jest.config';

const config: Config = {
  ...baseConfig,
  testTimeout: 180000,
};

export default config;
