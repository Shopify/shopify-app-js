import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    name: 'rest_resources',
    globals: true,
    environment: 'node',
    root: path.resolve(__dirname, '../../../rest/admin'),
    include: ['**/*.test.ts'],
    setupFiles: [path.resolve(__dirname, '../../setup-vitest.ts')],
  },
});
