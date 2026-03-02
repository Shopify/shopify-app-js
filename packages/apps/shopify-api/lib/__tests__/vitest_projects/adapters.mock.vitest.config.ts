import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    name: 'adapters:mock',
    globals: true,
    environment: 'node',
    root: path.resolve(__dirname, '../../../adapters/mock'),
    include: ['**/*.test.ts'],
  },
});
