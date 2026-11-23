/** @jest-config-loader ts-node */
import type {Config} from 'jest';

import baseConfig from '../../../config/tests/jest.config';

const esModules = [
  '@web3-storage\\+',
  'react-router@',
  'cookie-es@',
  '@remix-run\\+route-pattern@',
].join('|');
const transformIgnorePatterns = [
  'node_modules/(?!\\.pnpm/|react-router/|cookie-es/|@remix-run/route-pattern/|@web3-storage/)',
  `node_modules/.pnpm/(?!${esModules})`,
];

const config: Config = {
  ...baseConfig,
  projects: [
    {
      displayName: 'shopify-app-react-router-react',
      preset: 'ts-jest',
      testMatch: ['**/*.test.ts', '**/*.test.tsx'],
      testEnvironment: 'jsdom',
      testPathIgnorePatterns: ['src/server'],
      setupFilesAfterEnv: [...(baseConfig.setupFilesAfterEnv ?? [])],
      transform: {
        '^.+\\.[cm]?jsx?$': ['babel-jest', {configFile: './babel.config.js'}],
      },
      transformIgnorePatterns,
    },
    {
      displayName: 'shopify-app-react-router-server-node',
      preset: 'ts-jest',
      testMatch: ['**/*.test.ts', '**/*.test.tsx'],
      setupFilesAfterEnv: [
        ...(baseConfig.setupFilesAfterEnv ?? []),
        `${__dirname}/src/server/adapters/node/__tests__/setup-jest.ts`,
      ],
      transform: {
        '^.+\\.[cm]?jsx?$': ['babel-jest', {configFile: './babel.config.js'}],
      },
      transformIgnorePatterns,
      testPathIgnorePatterns: ['src/react', 'src/server/adapters/__tests__'],
    },
    {
      displayName: 'shopify-app-react-router-server-adapters',
      preset: 'ts-jest',
      rootDir: './src/server/adapters',
      testMatch: ['**/*.test.ts', '**/*.test.tsx'],
      setupFilesAfterEnv: [...(baseConfig.setupFilesAfterEnv ?? [])],
      transform: {
        '^.+\\.[cm]?jsx?$': ['babel-jest', {configFile: './babel.config.js'}],
      },
      transformIgnorePatterns,
    },
  ],
};

export default config;
