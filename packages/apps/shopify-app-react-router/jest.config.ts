import type {Config} from 'jest';

import baseConfig from '../../../config/tests/jest.config';

const config: Config = {
  ...baseConfig,
  projects: [
    {
      displayName: 'shopify-app-react-router-server-node',
      preset: 'ts-jest',
      testMatch: ['**/*.test.ts', '**/*.test.tsx'],
      setupFilesAfterEnv: [
        ...(baseConfig.setupFilesAfterEnv ?? []),
        `${__dirname}/src/server/adapters/node/__tests__/setup-jest.ts`,
      ],
      testPathIgnorePatterns: ['src/server/adapters/__tests__'],
    },
    {
      displayName: 'shopify-app-react-router-server-adapters',
      preset: 'ts-jest',
      rootDir: './src/server/adapters',
      testMatch: ['**/*.test.ts', '**/*.test.tsx'],
      setupFilesAfterEnv: [...(baseConfig.setupFilesAfterEnv ?? [])],
    },
  ],
};

export default config;
