import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  // Use tsc for declarations
  dts: false,
  sourcemap: true,
  clean: true,
  external: [
    '@graphql-codegen/cli',
    '@graphql-codegen/introspection',
    '@graphql-codegen/typescript',
    '@parcel/watcher',
    '@shopify/graphql-codegen',
    'graphql',
  ],
});
