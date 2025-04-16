import type {Config} from 'jest';

import baseConfig from '../../../config/tests/jest.config';

const config: Config = {
  ...baseConfig,
  displayName: '@shopify/shopify-app-remix-extended',
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/dist/', '\\.d\\.ts$'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@shopify/shopify-app-remix$':
      '<rootDir>/../shopify-app-remix/src/index.ts',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.mts'],
};

export default config;
