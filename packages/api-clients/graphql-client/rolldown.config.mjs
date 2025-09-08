import {getConfig, getUmdConfig} from '../../../config/rolldown/rolldown-utils.mjs';
import pkg from './package.json' with { type: 'json' };

const mainSrcInput = 'src/index.ts';
const clientSrcInput = 'src/graphql-client/index.ts';

// Note: rollup-plugin-dts will still be needed as a separate step for bundling .d.ts files
const config = [
  // UMD minified build (uses rollup-plugin-swc3 for best compression)
  getUmdConfig({
    pkg,
    input: clientSrcInput,
    outputFile: './dist/umd/graphql-client.min.js',
    globalName: 'ShopifyGraphQLClient',
    minify: true,
  }),
  // UMD non-minified build
  getUmdConfig({
    pkg,
    input: clientSrcInput,
    outputFile: './dist/umd/graphql-client.js',
    globalName: 'ShopifyGraphQLClient',
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
