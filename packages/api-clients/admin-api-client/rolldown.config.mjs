import {getConfig} from '../../../config/rolldown/rolldown-utils.mjs';
import pkg from './package.json' with {type: 'json'};

// Admin API client doesn't need UMD builds, only ESM and CJS
const config = getConfig({
  pkg,
  input: 'src/index.ts',
  flatOutput: true,
  replacements: {
    ROLLDOWN_REPLACE_CLIENT_VERSION: JSON.stringify(pkg.version),
  },
});

export default config;
