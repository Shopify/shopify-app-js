import pkg from '../../package.json' with {type: 'json'};

const config = {
  output: {
    dir: 'bundle',
    format: 'esm',
    entryFileNames: '[name].mjs',
  },
  external: Object.keys(pkg.dependencies),
  resolve: {
    extensions: ['.ts', '.js'],
  },
};

const configArray = [
  {
    ...config,
    input: 'adapters/__e2etests__/test_apps/test-dummy-shopify-server.ts',
  },
  {
    ...config,
    input: 'adapters/__e2etests__/test_apps/test-node-app.ts',
  },
  {
    ...config,
    input: 'adapters/__e2etests__/test_apps/test-web-api-app.ts',
  },
];

export default configArray;
