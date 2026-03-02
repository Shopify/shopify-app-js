import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    name: 'library',
    globals: true,
    environment: 'node',
    root: path.resolve(__dirname, '../../'),
    include: ['**/*.test.ts'],
    setupFiles: [path.resolve(__dirname, '../../setup-vitest.ts')],
  },
});
