import {createWorkspace, createWorkspacePlugin} from '@shopify/loom';
import {buildLibraryWorkspace} from '@shopify/loom-plugin-build-library';
import {eslint} from '@shopify/loom-plugin-eslint';
import {prettier} from '@shopify/loom-plugin-prettier';

import type {} from '@shopify/loom-plugin-jest';

export default createWorkspace((workspace) => {
  workspace.use(
    buildLibraryWorkspace(),
    eslint(),
    prettier({files: '**/*.{json,md}'}),
    jestWorkspaceConfigPlugin(),
  );
});

function jestWorkspaceConfigPlugin() {
  return createWorkspacePlugin(
    'shopify-app-js--workplace-setup',
    ({tasks: {test}}) => {
      test.hook(({hooks}) => {
        hooks.configure.hook((configure) => {
          configure.jestSetupFilesAfterEnv?.hook((files) => [
            ...files,
            '../../tests/setup/setup-jest.ts',
          ]);
          // Increase the test timeout to 20 seconds
          configure.jestConfig?.hook((config) => ({
            ...config,
            testTimeout: 30000,
          }));
        });
      });
    },
  );
}
