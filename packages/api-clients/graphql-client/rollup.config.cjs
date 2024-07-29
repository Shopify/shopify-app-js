import dts from 'rollup-plugin-dts';

import {getConfig, getPlugins} from '../../../config/rollup/rollup-utils';

import * as pkg from './package.json';

const mainSrcInput = 'src/index.ts';
const clientSrcInput = 'src/graphql-client/index.ts';

const packageName = pkg.name.substring(1);
export const bannerConfig = {
  banner: `/*! ${packageName}@${pkg.version} -- Copyright (c) 2023-present, Shopify Inc. -- license (MIT): https://github.com/Shopify/shopify-app-js/blob/main/LICENSE.md */`,
};

const config = [
  {
    input: clientSrcInput,
    plugins: getPlugins({
      outDir: './dist/ts',
      minify: true,
      tsconfig: './tsconfig.umd.json',
      replacements: {ROLLUP_REPLACE_CLIENT_VERSION: pkg.version},
      bundleDependencies: true,
    }),
    output: [
      {
        file: './dist/umd/graphql-client.min.js',
        format: 'umd',
        sourcemap: true,
        name: 'ShopifyGraphQLClient',
        ...bannerConfig,
      },
    ],
  },
  {
    input: clientSrcInput,
    plugins: getPlugins({
      outDir: './dist/ts',
      tsconfig: './tsconfig.umd.json',
      replacements: {ROLLUP_REPLACE_CLIENT_VERSION: pkg.version},
      bundleDependencies: true,
    }),
    output: [
      {
        file: './dist/umd/graphql-client.js',
        format: 'umd',
        sourcemap: true,
        name: 'ShopifyGraphQLClient',
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
    output: [{file: 'dist/graphql-client.d.ts', format: 'es'}],
    plugins: [dts.default()],
  },
];

export default config;
