import path from 'path';
import {fileURLToPath} from 'url';

import type {Config} from 'jest';

import baseConfig from '../../../config/tests/jest.config.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const esModules = ['@web3-storage'].join('|');

const config: Config = {
  ...baseConfig,
  projects: [
    {
      ...baseConfig,
      displayName: 'shopify-app-react-router-react',
      testEnvironment: 'jsdom',
      testPathIgnorePatterns: [
        ...(baseConfig.testPathIgnorePatterns ?? []),
        'src/server',
      ],
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {useESM: true}],
        '^.+\\.(js|jsx)$': ['babel-jest', {configFile: './babel.config.js'}],
      },
      transformIgnorePatterns: [`node_modules/.pnpm/(?!${esModules})`],
    },
    {
      ...baseConfig,
      displayName: 'shopify-app-react-router-server-node',
      setupFilesAfterEnv: [
        ...(baseConfig.setupFilesAfterEnv ?? []),
        `${__dirname}/src/server/adapters/node/__tests__/setup-jest.ts`,
      ],
      testPathIgnorePatterns: [
        ...(baseConfig.testPathIgnorePatterns ?? []),
        'src/react',
        'src/server/adapters/__tests__',
      ],
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {useESM: true}],
      },
    },
    {
      ...baseConfig,
      displayName: 'shopify-app-react-router-server-adapters',
      rootDir: './src/server/adapters',
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {useESM: true}],
      },
    },
  ],
};

export default config;
