import dts from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

import * as pkg from './package.json';

export const mainSrcInput = 'src/index.ts';

export function getPlugins() {
  return [
    replace({
      preventAssignment: true,
    }),
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      noEmit: true,
      emitDeclarationOnly: true,
      outDir: './dist/ts',
    }),
  ];
}

const packageName = pkg.name.substring(1);
export const bannerConfig = {
  banner: `/*! ${packageName}@${pkg.version} -- Copyright (c) 2023-present, Shopify Inc. -- license (MIT): https://github.com/Shopify/shopify-app-js/blob/main/LICENSE.md */`,
};

const config = [
  {
    input: mainSrcInput,
    plugins: getPlugins(),
    external: Object.keys(pkg.dependencies),
    output: [
      {
        dir: './dist',
        format: 'es',
        sourcemap: true,
        entryFileNames: '[name].mjs',
      },
    ],
  },
  {
    input: mainSrcInput,
    plugins: getPlugins(),
    external: Object.keys(pkg.dependencies),
    output: [
      {
        dir: './dist',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
    ],
  },
  {
    input: './dist/ts/index.d.ts',
    output: [{file: 'dist/index.d.ts', format: 'es'}],
    plugins: [dts.default()],
  },
];

export default config;
