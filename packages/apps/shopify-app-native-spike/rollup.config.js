import {getConfig} from '../../../config/rollup/rollup-utils';

import * as pkg from './package.json';

export default getConfig({pkg, input: ['src/index.ts', 'src/transport.ts']});
