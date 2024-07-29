import dts from 'rollup-plugin-dts';

import {getConfig, getPlugins} from '../../../config/rollup/rollup-utils';

import * as pkg from './package.json';

export const mainSrcInput = 'src/index.ts';

const packageName = pkg.name.substring(1);
export const bannerConfig = {
  banner: `/*! ${packageName}@${pkg.version} -- Copyright (c) 2023-present, Shopify Inc. -- license (MIT): https://github.com/Shopify/shopify-app-js/blob/main/LICENSE.md */`,
};

const config = [
  {
    input: mainSrcInput,
    plugins: getPlugins({
      outDir: './dist/ts',
      minify: true,
      tsconfig: './tsconfig.umd.json',
      replacements: {ROLLUP_REPLACE_CLIENT_VERSION: pkg.version},
      bundleDependencies: true,
    }),
    output: [
      {
        file: './dist/umd/storefront-api-client.min.js',
        format: 'umd',
        sourcemap: true,
        name: 'ShopifyStorefrontAPIClient',
        ...bannerConfig,
      },
    ],
  },
  {
    input: mainSrcInput,
    plugins: getPlugins({
      outDir: './dist/ts',
      tsconfig: './tsconfig.umd.json',
      replacements: {ROLLUP_REPLACE_CLIENT_VERSION: pkg.version},
      bundleDependencies: true,
    }),
    output: [
      {
        file: './dist/umd/storefront-api-client.js',
        format: 'umd',
        sourcemap: true,
        name: 'ShopifyStorefrontAPIClient',
        ...bannerConfig,
      },
    ],
  },
  ...getConfig({
    pkg,
    input: mainSrcInput,
    flatOutput: true,
    replacements: {ROLLUP_REPLACE_CLIENT_VERSION: pkg.version},
  }),
  {
    input: './dist/ts/index.d.ts',
    output: [{file: 'dist/storefront-api-client.d.ts', format: 'es'}],
    plugins: [dts.default()],
  },
];

export default config;
