import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  // Use tsc for declarations
  dts: false,
  sourcemap: true,
  clean: true,
  external: [
    '@shopify/shopify-api',
    '@shopify/shopify-app-session-storage',
    '@shopify/shopify-app-session-storage-memory',
    'express',
    'compare-versions',
  ],
});
