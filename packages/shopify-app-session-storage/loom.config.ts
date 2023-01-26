import {createPackage, createProjectPlugin} from '@shopify/loom';
import {buildLibrary} from '@shopify/loom-plugin-build-library';

export default createPackage((pkg) => {
  pkg.entry({root: './src/index.ts'});
  pkg.use(
    buildLibrary({
      // Required. A browserslist string for specifying your target output.
      // Use browser targets (e.g. `'defaults'`) if your package targets the browser,
      // node targets (e.g. `'node 12.22'`) if your package targets node
      // or both (e.g.`'defaults, node 12.22'`) if your package targets both
      targets: 'node 14',
      // Optional. Defaults to false. Defines if commonjs outputs should be generated.
      commonjs: true,
      // Optional. Defaults to false. Defines if esmodules outputs should be generated.
      esmodules: false,
      // Optional. Defaults to false. Defines if esnext outputs should be generated.
      esnext: false,
      // Optional. Defaults to true. Defines if entrypoints should be written at
      // the root of the repository. You can disable this if you have a single
      // entrypoint or if your package uses the `exports` key in package.json
      rootEntrypoints: false,
      // Optional. Defaults to 'node'. Defines if the jest environment should be 'node' or 'jsdom'.
      jestTestEnvironment: 'node',
    }),
    jestConfigPlugin(),
  );
});

function jestConfigPlugin() {
  return createProjectPlugin(
    'sessionStorageJestAdjustments',
    ({tasks: {test}}) => {
      test.hook(({hooks}) => {
        hooks.configure.hook((configure) => {
          // If no tests, pass the suite
          configure.jestConfig?.hook((config) => ({
            ...config,
            passWithNoTests: true,
          }));
        });
      });
    },
  );
}
