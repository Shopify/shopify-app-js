import dts from 'rollup-plugin-dts';

import * as pkg from './package.json';
import {getConfig} from '../../../config/rollup/rollup-utils';

export const mainSrcInput = 'src/index.ts';

export default [
  ...getConfig({
    pkg,
    input: mainSrcInput,
    replacements: {ROLLUP_REPLACE_CLIENT_VERSION: pkg.version},
    flatOutput: true,
  }),
  {
    input: './dist/ts/index.d.ts',
    output: [{file: 'dist/admin-api-client.d.ts', format: 'es'}],
    plugins: [dts.default()],
  },
];
