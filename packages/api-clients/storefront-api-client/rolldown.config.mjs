import {getConfig, getUmdConfig} from '../../../config/rolldown/rolldown-utils.mjs';
import pkg from './package.json' with { type: 'json' };

const mainSrcInput = 'src/index.ts';

// Note: rollup-plugin-dts will still be needed as a separate step for bundling .d.ts files
const config = [
  // UMD minified build
  getUmdConfig({
    pkg,
    input: mainSrcInput,
    outputFile: './dist/umd/storefront-api-client.min.js',
    globalName: 'ShopifyStorefrontAPIClient',
    minify: true,
  }),
  // UMD non-minified build
  getUmdConfig({
    pkg,
    input: mainSrcInput,
    outputFile: './dist/umd/storefront-api-client.js',
    globalName: 'ShopifyStorefrontAPIClient',
    minify: false,
  }),
  // ESM and CJS builds
  ...getConfig({
    pkg,
    input: mainSrcInput,
    flatOutput: true,
    replacements: {
      ROLLDOWN_REPLACE_CLIENT_VERSION: JSON.stringify(pkg.version),
    },
  }),
];

export default config;
