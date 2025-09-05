import path from 'path';

import type {Config} from 'jest';

import baseConfig from '../../../config/tests/jest.config';

const config: Config = {
  moduleNameMapper: {
    '^@shopify/shopify-api$': path.resolve(
      __dirname,
      '../shopify-api/lib/index.ts',
    ),
    '^@shopify/shopify-api/adapters/web-api$': path.resolve(
      __dirname,
      '../shopify-api/adapters/web-api/index.ts',
    ),
    '^@shopify/shopify-api/adapters/(.*)$': path.resolve(
      __dirname,
      '../shopify-api/adapters/$1/index.ts',
    ),
    '^@shopify/shopify-api/runtime$': path.resolve(
      __dirname,
      '../shopify-api/runtime/index.ts',
    ),
    '^@shopify/shopify-api/(.*)$': path.resolve(__dirname, '../shopify-api/$1'),
    '^@shopify/shopify-app-session-storage-memory$': path.resolve(
      __dirname,
      '../session-storage/shopify-app-session-storage-memory/src/memory.ts',
    ),
  },
  ...baseConfig,
};

export default config;
