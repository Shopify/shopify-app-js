import path from 'path';
import {defineWorkersConfig} from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    name: 'adapters:cf-worker',
    root: path.resolve(__dirname, '../../../adapters/cf-worker'),
    include: ['**/*.test.ts'],
    poolOptions: {
      workers: {
        wrangler: {configPath: './__tests__/wrangler.toml'},
      },
    },
  },
});
