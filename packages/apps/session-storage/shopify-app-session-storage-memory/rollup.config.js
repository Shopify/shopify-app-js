import {getConfig} from '../../../../config/rollup/rollup-utils';

import * as pkg from './package.json';

const config = getConfig({pkg, input: 'src/memory.ts'});

export default config;
