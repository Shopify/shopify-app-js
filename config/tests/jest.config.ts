import path from 'path';

import type {Config} from 'jest';

// Resolve @shopify/shopify-api to its TypeScript source so that ts-jest can
// transform dynamic `import('jose')` calls into `require()`.  The pre-built
// CJS dist uses `await import('jose')` which fails inside Jest's VM sandbox
// (jose v6 is ESM-only and dynamic import requires --experimental-vm-modules).
const shopifyApiSrc = path.resolve(
  __dirname,
  '../../packages/apps/shopify-api',
);

const config: Config = {
  preset: 'ts-jest',
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: [`${__dirname}/setup-jest.ts`],
  verbose: false,
  // jose v6 is ESM-only; transform it to CJS for jest and polyfill Web Crypto
  transformIgnorePatterns: ['/node_modules/(?!jose)'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {tsconfig: {module: 'CommonJS'}},
    ],
    '^.+\\.js$': [
      'ts-jest',
      {
        useESM: false,
        tsconfig: {
          allowJs: true,
          esModuleInterop: true,
          module: 'CommonJS',
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@shopify/shopify-api$': path.join(shopifyApiSrc, 'lib/index.ts'),
    '^@shopify/shopify-api/test-helpers$': path.join(
      shopifyApiSrc,
      'test-helpers/index.ts',
    ),
    '^@shopify/shopify-api/runtime$': path.join(
      shopifyApiSrc,
      'runtime/index.ts',
    ),
    '^@shopify/shopify-api/adapters/(.*)$': path.join(
      shopifyApiSrc,
      'adapters/$1/index.ts',
    ),
  },
  setupFiles: [`${__dirname}/setup-crypto.ts`],
};

export default config;
