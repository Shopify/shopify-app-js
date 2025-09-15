import type {Config} from 'jest';

import baseConfig from './base.jest.config.ts';

const config: Config = {
  ...baseConfig,
  displayName: 'adapters:mock',
  rootDir: '../../../adapters/mock',
};

export default config;
