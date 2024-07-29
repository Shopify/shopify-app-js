import dts from 'rollup-plugin-dts';

import * as pkg from './package.json';
import {getConfig} from '../../../config/rollup/rollup-utils';

export default [
  ...getConfig({
    pkg,
    input: 'src/index.ts',
    flatOutput: true,
  }),
  {
    input: './dist/ts/index.d.ts',
    output: [{file: 'dist/index.d.ts', format: 'es'}],
    plugins: [dts.default()],
  },
];
