import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import excludeDependenciesFromBundle from 'rollup-plugin-exclude-dependencies-from-bundle';
import copy from 'rollup-plugin-copy';

import * as pkg from '../../package.json';

export const mainSrcInput = 'src/index.ts';

export function getPlugins(format) {
  const esmConfig = {
    emitDeclarationOnly: true,
  };
  const cjsConfig = {
    noEmit: true,
    declaration: false,
  };

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
      ...(format === 'esm' ? esmConfig : cjsConfig),
      tsconfig: './tsconfig.json',
      outDir: `./dist/${format}/ts`,
    }),
    ...(format === 'esm'
      ? [
          copy({
            targets: [
              {src: './dist/esm/ts', dest: './dist/ts', overwrite: true},
            ],
          }),
        ]
      : []),
  ];
}

export function getConfig() {
  return [
    {
      input: mainSrcInput,
      plugins: getPlugins('esm'),
      external: Object.keys(pkg.dependencies),
      output: [
        {
          dir: './dist/esm',
          format: 'es',
          sourcemap: true,
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].mjs',
        },
      ],
    },
    {
      input: mainSrcInput,
      plugins: getPlugins('cjs'),
      external: Object.keys(pkg.dependencies),
      output: [
        {
          dir: './dist/cjs',
          format: 'cjs',
          sourcemap: true,
          preserveModules: true,
          preserveModulesRoot: 'src',
          exports: 'named',
        },
      ],
    },
  ];
}

const config = getConfig();

export default config;
