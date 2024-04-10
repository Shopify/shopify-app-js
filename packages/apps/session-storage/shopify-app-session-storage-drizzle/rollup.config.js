import {getConfig} from '../../../../config/rollup/rollup-utils';

import * as pkg from './package.json';

const config = getConfig(pkg, 'src/drizzle.ts');

export default config;
