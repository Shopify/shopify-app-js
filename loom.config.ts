import {createWorkspace, createWorkspacePlugin} from '@shopify/loom';
import {buildLibraryWorkspace} from '@shopify/loom-plugin-build-library';
import {eslint} from '@shopify/loom-plugin-eslint';
import {prettier} from '@shopify/loom-plugin-prettier';
import {Config} from '@jest/types';

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
          configure.jestConfig?.hook((config) => {
            const projects = forkRemixProject(
              config.projects as Config.InitialProjectOptions[],
            );
            return {...config, projects, testTimeout: 30000};
          });
        });
      });
    },
  );
}

/**
 * The remix project is a bit of a special case because we need to run its tests in two different environments, one
 * using jsdom and the other, node.
 *
 * To achieve that, we create two separate projects which copy all of the settings from the original project, overriding
 * the test environment and making them mutually exclusive.
 */
function forkRemixProject(projects: Config.InitialProjectOptions[]) {
  return projects.reduce((acc, project) => {
    if (
      typeof project !== 'string' &&
      project.displayName === 'shopify-app-remix'
    ) {
      return acc.concat(
        [
          {
            ...project,
            displayName: 'shopify-app-remix-react',
            testEnvironment: 'jsdom',
            testPathIgnorePatterns: ['src/server'],
          },
        ],
        [
          {
            ...project,
            setupFilesAfterEnv: [
              ...(project.setupFilesAfterEnv ?? []),
              '../../packages/shopify-app-remix/src/server/adapters/node/__tests__/setup-jest.ts',
            ],
            displayName: 'shopify-app-remix-server-node',
            testEnvironment: 'node',
            testPathIgnorePatterns: [
              'src/react',
              'src/server/adapters/__tests__',
            ],
          },
        ],
        [
          {
            ...project,
            setupFilesAfterEnv: [
              ...(project.setupFilesAfterEnv ?? []),
              '../../packages/shopify-app-remix/src/server/adapters/vercel/__tests__/setup-jest.ts',
            ],
            displayName: 'shopify-app-remix-server-vercel',
            testEnvironment: 'node',
            testPathIgnorePatterns: [
              'src/react',
              'src/server/adapters/__tests__',
            ],
          },
        ],
        [
          {
            ...project,
            testRegex: undefined,
            displayName: 'shopify-app-remix-server-adapters',
            testMatch: ['<rootDir>/src/server/adapters/__tests__/**/*'],
            testEnvironment: 'node',
          },
        ],
      );
    } else {
      return acc.concat(project);
    }
  }, [] as Config.InitialProjectOptions[]);
}
