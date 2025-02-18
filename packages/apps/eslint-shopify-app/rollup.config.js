import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'default',
      sourcemap: true,
    },
    plugins: [
      resolve({
        extensions: ['.ts', '.js'],
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.build.json',
        outDir: 'dist',
      }),
    ],
    external: ['@typescript-eslint/utils'],
  },
  {
    input: './dist/index.d.ts',
    output: [{file: 'dist/index.d.ts', format: 'es'}],
    plugins: [dts.default()],
  },
];