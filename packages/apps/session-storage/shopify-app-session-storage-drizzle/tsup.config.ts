import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/drizzle.ts'],
  format: ['cjs', 'esm'],
  // Use tsc for declarations
  dts: false,
  sourcemap: true,
  clean: true,
  external: [
    '@shopify/shopify-api',
    '@shopify/shopify-app-session-storage',
    'drizzle-orm',
    'tslib',
  ],
});
