import type {Config} from 'jest';

import baseConfig from '../../../../config/tests/jest.config.ts';

const config: Config = {
  ...baseConfig,
  passWithNoTests: true,
};

export default config;
