import {getConfig} from '../../../../config/rollup/rollup-utils';

import * as pkg from './package.json';

const config = getConfig(pkg, 'src/sqlite.ts');

export default config;
