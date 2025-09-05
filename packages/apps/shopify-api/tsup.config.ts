import fs from 'fs';
import path from 'path';

import {defineConfig} from 'tsup';

// Find adapter entries
const adapterEntries = fs
  .readdirSync('adapters')
  .filter(
    (dir) =>
      fs.statSync(path.join('adapters', dir)).isDirectory() &&
      !['__tests__', '__e2etests__'].includes(dir),
  )
  .map((dir) => `adapters/${dir}/index.ts`);

// Find REST API entries
const restEntries = fs
  .readdirSync('rest/admin')
  .filter((dir) => fs.statSync(path.join('rest/admin', dir)).isDirectory())
  .map((dir) => `rest/admin/${dir}/index.ts`);

export default defineConfig({
  entry: [
    'lib/index.ts',
    'runtime/index.ts',
    'test-helpers/index.ts',
    ...adapterEntries,
    ...restEntries,
  ],
  format: ['cjs', 'esm'],
  // Use tsc for declarations
  dts: false,
  sourcemap: true,
  clean: true,
  external: [
    '@shopify/admin-api-client',
    '@shopify/graphql-client',
    '@shopify/storefront-api-client',
    'compare-versions',
    'isbot',
    'jose',
    'jsonwebtoken',
    'node-fetch',
    'tslib',
    'uuid',
  ],
  splitting: false,
});
