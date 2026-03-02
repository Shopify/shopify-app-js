import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    name: 'test_helpers',
    globals: true,
    environment: 'node',
    root: path.resolve(__dirname, '../../../test-helpers'),
    include: ['**/*.test.ts'],
    setupFiles: [path.resolve(__dirname, '../../setup-vitest.ts')],
  },
});
