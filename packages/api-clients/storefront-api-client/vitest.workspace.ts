import {defineWorkspace} from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'test:browser',
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.browser.test.ts', 'src/**/*.test.ts'],
      exclude: ['**/*.server.test.ts'],
      setupFiles: ['../../../config/tests/setup-vitest.ts'],
    },
  },
  {
    test: {
      name: 'test:server',
      globals: true,
      environment: 'node',
      include: ['src/**/*.server.test.ts', 'src/**/*.test.ts'],
      exclude: ['**/*.browser.test.ts'],
      setupFiles: ['../../../config/tests/setup-vitest.ts'],
    },
  },
]);
