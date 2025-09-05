import path from 'path';

import type {Config} from 'jest';

import baseConfig from '../../../config/tests/jest.config';

const esModules = ['@web3-storage'].join('|');

const moduleNameMapper = {
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
  '^@shopify/shopify-app-session-storage$': path.resolve(
    __dirname,
    '../session-storage/shopify-app-session-storage/src/index.ts',
  ),
};

const config: Config = {
  ...baseConfig,
  projects: [
    {
      displayName: 'shopify-app-remix-react',
      preset: 'ts-jest',
      testMatch: ['**/*.test.ts', '**/*.test.tsx'],
      testEnvironment: 'jsdom',
      testPathIgnorePatterns: ['src/server'],
      transform: {
        '^.+\\.(js|jsx)$': ['babel-jest', {configFile: './babel.config.js'}],
      },
      transformIgnorePatterns: [`node_modules/.pnpm/(?!${esModules})`],
      moduleNameMapper,
    },
    {
      displayName: 'shopify-app-remix-server-node',
      preset: 'ts-jest',
      testMatch: ['**/*.test.ts', '**/*.test.tsx'],
      setupFilesAfterEnv: [
        ...(baseConfig.setupFilesAfterEnv ?? []),
        `${__dirname}/src/server/adapters/node/__tests__/setup-jest.ts`,
      ],
      testPathIgnorePatterns: ['src/react', 'src/server/adapters/__tests__'],
      moduleNameMapper,
    },
    {
      displayName: 'shopify-app-remix-server-vercel',
      preset: 'ts-jest',
      testMatch: ['**/*.test.ts', '**/*.test.tsx'],
      setupFilesAfterEnv: [
        ...(baseConfig.setupFilesAfterEnv ?? []),
        `${__dirname}/src/server/adapters/vercel/__tests__/setup-jest.ts`,
      ],
      testPathIgnorePatterns: ['src/react', 'src/server/adapters/__tests__'],
      moduleNameMapper,
    },
    {
      displayName: 'shopify-app-remix-server-adapters',
      preset: 'ts-jest',
      rootDir: './src/server/adapters',
      testMatch: ['**/*.test.ts', '**/*.test.tsx'],
      moduleNameMapper,
    },
  ],
};

export default config;
