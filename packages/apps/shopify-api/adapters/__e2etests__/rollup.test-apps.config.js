import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import excludeDependenciesFromBundle from 'rollup-plugin-exclude-dependencies-from-bundle';

import * as pkg from '../../package.json';

const config = {
  output: [{dir: 'bundle', format: 'esm', entryFileNames: '[name].mjs'}],
  external: Object.keys(pkg.dependencies),
  plugins: [
    excludeDependenciesFromBundle({dependencies: true, peerDependencies: true}),
    resolve({extensions: ['.ts', '.js'], browser: true}),
    replace({preventAssignment: true}),
    commonjs(),
    typescript({
      include: [`./**/*.ts`],
      outDir: 'bundle',
      noEmit: false,
      emitDeclarationOnly: false,
    }),
  ],
};

const configArray = [
  {
    ...config,
    input: ['adapters/__e2etests__/test_apps/test-dummy-shopify-server.ts'],
  },
  {
    ...config,
    input: ['adapters/__e2etests__/test_apps/test-node-app.ts'],
  },
  {
    ...config,
    input: ['adapters/__e2etests__/test_apps/test-web-api-app.ts'],
  },
];

export default configArray;
