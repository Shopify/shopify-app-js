import path from 'path';
import {defineWorkersConfig} from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    name: 'adapters:web-api',
    root: path.resolve(__dirname, '../../../adapters/web-api'),
    include: ['**/*.test.ts'],
    poolOptions: {
      workers: {
        wrangler: {configPath: './__tests__/wrangler.toml'},
      },
    },
  },
});
