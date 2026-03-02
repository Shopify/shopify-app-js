import {defineWorkspace} from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineWorkspace([
  {
    plugins: [react()],
    test: {
      name: 'shopify-app-react-router-react',
      globals: true,
      environment: 'jsdom',
      environmentOptions: {
        jsdom: {
          // Match Jest's default jsdom URL so existing tests don't need updating.
          url: 'http://localhost',
        },
      },
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      exclude: ['src/server/**'],
      setupFiles: ['../../../config/tests/setup-vitest.ts'],
      server: {
        deps: {
          inline: ['@web3-storage'],
        },
      },
    },
  },
  {
    test: {
      name: 'shopify-app-react-router-server-node',
      globals: true,
      environment: 'node',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      exclude: ['src/react/**', 'src/server/adapters/__tests__/**'],
      setupFiles: [
        '../../../config/tests/setup-vitest.ts',
        './src/server/adapters/node/__tests__/setup-vitest.ts',
      ],
    },
  },
  {
    resolve: {
      // Allow require('../node/index') to find TypeScript files.
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    test: {
      name: 'shopify-app-react-router-server-adapters',
      globals: true,
      environment: 'node',
      root: './src/server/adapters',
      include: ['**/*.test.ts', '**/*.test.tsx'],
    },
  },
]);
