import path from 'path';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import excludeDependenciesFromBundle from 'rollup-plugin-exclude-dependencies-from-bundle';

import * as pkg from '../../package.json';

export function getPlugins(outDir) {
  return [
    excludeDependenciesFromBundle({dependencies: true, peerDependencies: true}),
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    replace({
      preventAssignment: true,
    }),
    commonjs(),
    typescript({
      tsconfig: path.resolve('./tsconfig.build.json'),
      outDir,
      outputToFilesystem: false,
      noEmit: true,
      declaration: false,
      moduleResolution: 'Bundler',
    }),
  ];
}

export const esmConfigs = {
  dir: './dist/esm',
  format: 'es',
  sourcemap: true,
  preserveModules: true,
  preserveModulesRoot: 'src',
  entryFileNames: '[name].mjs',
};

export const cjsConfigs = {
  dir: './dist/cjs',
  format: 'cjs',
  sourcemap: true,
  preserveModules: true,
  preserveModulesRoot: 'src',
  exports: 'named',
};

export function getConfig(input = 'src/index.ts') {
  return [
    {
      input,
      plugins: getPlugins('./dist/esm'),
      external: Object.keys(pkg.dependencies),
      output: [esmConfigs],
    },
    {
      input,
      plugins: getPlugins('./dist/cjs'),
      external: Object.keys(pkg.dependencies),
      output: [cjsConfigs],
    },
  ];
}

const config = getConfig();

export default config;
