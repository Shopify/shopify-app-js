import path from 'path';

import type {Config} from 'jest';

import baseConfig from '../../../../config/tests/jest.config';

const config: Config = {
  ...baseConfig,
  testTimeout: 30000,

  moduleNameMapper: {
    '^@shopify/shopify-api$': path.resolve(
      __dirname,
      '../../shopify-api/lib/index.ts',
    ),
    '^@shopify/shopify-app-session-storage$': path.resolve(
      __dirname,
      '../shopify-app-session-storage/src/index.ts',
    ),
  },
};

export default config;
