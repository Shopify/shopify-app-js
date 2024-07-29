import {getConfig} from '../../../../config/rollup/rollup-utils';

import * as pkg from './package.json';

const config = getConfig({pkg, input: 'src/mongodb.ts'});

export default config;
