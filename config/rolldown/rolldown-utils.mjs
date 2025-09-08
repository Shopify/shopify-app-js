// Rolldown configuration utilities
// This is a simplified version designed to work with Rolldown's built-in features
import {minify as swcMinify} from 'rollup-plugin-swc3';

export const esmConfigs = {
  dir: './dist/esm',
  format: 'es',
  sourcemap: true,
  preserveModules: true,
  preserveModulesRoot: 'src',
  entryFileNames: '[name].mjs',
};

export const cjsConfigs = {
  dir: './dist/cjs',
  format: 'cjs',
  sourcemap: true,
  preserveModules: true,
  preserveModulesRoot: 'src',
  exports: 'named',
};

export function getConfig({
  pkg,
  input = 'src/index.ts',
  flatOutput = false,
  replacements = {},
}) {
  // Extract dependencies for external configuration
  const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ];

  return [
    // ESM build
    {
      input,
      external,
      output: {
        ...esmConfigs,
        dir: flatOutput ? './dist' : './dist/esm',
      },
      define: replacements,
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    // CJS build
    {
      input,
      external,
      output: {
        ...cjsConfigs,
        dir: flatOutput ? './dist' : './dist/cjs',
      },
      define: replacements,
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  ];
}

// For UMD builds (used by API clients)
export function getUmdConfig({
  pkg,
  input,
  outputFile,
  globalName,
  minify = false,
}) {
  const packageName = pkg.name.substring(1);
  const banner = `/*! ${packageName}@${pkg.version} -- Copyright (c) 2023-present, Shopify Inc. -- license (MIT): https://github.com/Shopify/shopify-app-js/blob/main/LICENSE.md */`;

  const plugins = [];

  // Use rollup-plugin-swc3 for minification (best compression)
  if (minify) {
    plugins.push(
      swcMinify({
        sourceMap: true,
        module: true,
        compress: {
          passes: 2,
          drop_console: false,
          drop_debugger: true,
        },
        mangle: true,
        format: {
          comments: false,
        },
      }),
    );
  }

  return {
    input,
    output: {
      file: outputFile,
      format: 'umd',
      name: globalName,
      sourcemap: true,
      banner,
    },
    plugins,
    define: {
      ROLLDOWN_REPLACE_CLIENT_VERSION: JSON.stringify(pkg.version),
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    // Don't externalize anything for UMD builds - bundle everything
    external: [],
  };
}
