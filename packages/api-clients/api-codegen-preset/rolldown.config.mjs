import {getConfig} from '../../../config/rolldown/rolldown-utils.mjs';
import pkg from './package.json' with { type: 'json' };

// API codegen preset doesn't need UMD builds, only ESM and CJS
const config = getConfig({
  pkg,
  input: 'src/index.ts',
  flatOutput: true,
});

export default config;
