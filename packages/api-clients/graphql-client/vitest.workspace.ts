import {defineWorkspace} from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'test:browser',
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.test.ts'],
      exclude: ['**/*.server.test.ts'],
      setupFiles: ['./src/tests/setupTests.ts'],
    },
  },
  {
    test: {
      name: 'test:server',
      globals: true,
      environment: 'node',
      include: ['src/**/*.test.ts'],
      exclude: ['**/*.browser.test.ts'],
      setupFiles: ['./src/tests/setupTests.ts'],
    },
  },
]);
