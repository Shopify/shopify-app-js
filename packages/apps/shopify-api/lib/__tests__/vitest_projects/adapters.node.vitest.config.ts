import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    name: 'adapters:node',
    globals: true,
    environment: 'node',
    root: path.resolve(__dirname, '../../../adapters/node'),
    include: ['**/*.test.ts'],
  },
});
