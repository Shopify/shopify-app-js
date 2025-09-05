import fs from 'fs';
import path from 'path';

import {defineConfig} from 'tsup';

// Find adapter entries
const adapterEntries = fs.existsSync('src/server/adapters')
  ? fs
      .readdirSync('src/server/adapters')
      .filter((dir) =>
        fs.statSync(path.join('src/server/adapters', dir)).isDirectory(),
      )
      .map((dir) => `src/server/adapters/${dir}/index.ts`)
  : [];

export default defineConfig({
  entry: [
    'src/server/index.ts',
    'src/server/test-helpers/index.ts',
    'src/react/index.ts',
    ...adapterEntries,
  ],
  format: ['cjs', 'esm'],
  // Use tsc for declarations
  dts: false,
  sourcemap: true,
  clean: true,
  external: [
    '@remix-run/server-runtime',
    '@shopify/admin-api-client',
    '@shopify/shopify-api',
    '@shopify/shopify-app-session-storage',
    '@shopify/storefront-api-client',
    'isbot',
    'compare-versions',
    'react',
    '@remix-run/node',
    '@remix-run/react',
    '@shopify/polaris',
  ],
  splitting: false,
});
