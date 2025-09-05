import {defineConfig} from 'tsup';

export default defineConfig({
  entry: [
    'adapters/__e2etests__/test_apps/test-dummy-shopify-server.ts',
    'adapters/__e2etests__/test_apps/test-node-app.ts',
    'adapters/__e2etests__/test_apps/test-web-api-app.ts',
  ],
  format: ['esm'],
  outDir: 'bundle',
  outExtension: () => ({js: '.mjs'}),
  dts: false,
  sourcemap: false,
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
