import {getConfig} from '../../../../config/rolldown/rolldown-utils.mjs';
import pkg from './package.json' with { type: 'json' };

const config = getConfig({pkg, input: 'src/postgresql.ts'});

export default config;
