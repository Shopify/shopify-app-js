import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  // Use tsc for declarations
  dts: false,
  sourcemap: true,
  clean: true,
  // Use main tsconfig for tsup
  tsconfig: './tsconfig.json',
  define: {
    TSUP_REPLACE_CLIENT_VERSION: 'process.env.npm_package_version',
  },
});
