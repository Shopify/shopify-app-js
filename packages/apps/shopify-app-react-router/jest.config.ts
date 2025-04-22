import type {Config} from 'jest';
import {defaults} from 'jest-config';

const config: Config = {
  displayName: 'shopify-app-react-router',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: ['@babel/preset-env', '@babel/preset-typescript'],
      },
    ],
  },
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'mts', 'cts'],
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.mts'],
  transformIgnorePatterns: [
    'node_modules/(?!@shopify/admin-api-client|@shopify/storefront-api-client)',
  ],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    '^@remix-run/node$': '<rootDir>/node_modules/@react-router/node',
    '^@remix-run/react$': '<rootDir>/node_modules/react-router',
    '^@remix-run/server-runtime$': '<rootDir>/node_modules/react-router',
    '^@remix-run/testing$': '<rootDir>/node_modules/react-router',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFilesAfterEnv: ['<rootDir>/../../tools/test/setup.ts'],
  rootDir: '.',
};

export default config;
