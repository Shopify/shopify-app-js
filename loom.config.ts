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
            return {
              ...config,
              projects: configureProjects(
                config.projects as Config.InitialProjectOptions[],
              ),
              testTimeout: 30000,
            };
          });
        });
      });
    },
  );
}

function configureProjects(projects: Config.InitialProjectOptions[]) {
  return setTransformIgnorePatterns(projects).reduce((acc, project) => {
    if (
      typeof project !== 'string' &&
      project.displayName === 'shopify-app-remix'
    ) {
      return acc.concat(forkRemixProject(project));
    }

    /*
     * drizzle-orm is a special case because it seems to be ESM-only, so we need jest to run it through babel for the
     * tests to work.
     */

    if (
      typeof project !== 'string' &&
      project.displayName === 'shopify-app-session-storage-drizzle'
    ) {
      project.transformIgnorePatterns = [
        ...(project.transformIgnorePatterns ?? []),
        'node_modules/(?!drizzle-orm)',
      ];
    }

    return acc.concat(project);
  }, [] as Config.InitialProjectOptions[]);
}

/**
 * Some ESM-only packages need to be included in jest transforms for them to work. This function adds them to the
 * transformIgnorePatterns array for each project.
 */
function setTransformIgnorePatterns(projects: Config.InitialProjectOptions[]) {
  return projects.map((project) => {
    return {
      ...project,
      transformIgnorePatterns: [
        ...(project.transformIgnorePatterns || []),
        'node_modules/(?!@web3-storage)',
      ],
    };
  });
}

/**
 * The remix project is a bit of a special case because we need to run its tests in two different environments, one
 * using jsdom and the other, node.
 *
 * To achieve that, we create two separate projects which copy all of the settings from the original project, overriding
 * the test environment and making them mutually exclusive.
 */
function forkRemixProject(project: Config.InitialProjectOptions) {
  return [
    {
      ...project,
      displayName: 'shopify-app-remix-react',
      testEnvironment: 'jsdom',
      testPathIgnorePatterns: ['src/server'],
    },
    {
      ...project,
      setupFilesAfterEnv: [
        ...(project.setupFilesAfterEnv ?? []),
        '../../packages/shopify-app-remix/src/server/adapters/node/__tests__/setup-jest.ts',
      ],
      displayName: 'shopify-app-remix-server-node',
      testEnvironment: 'node',
      testPathIgnorePatterns: ['src/react', 'src/server/adapters/__tests__'],
    },
    {
      ...project,
      setupFilesAfterEnv: [
        ...(project.setupFilesAfterEnv ?? []),
        '../../packages/shopify-app-remix/src/server/adapters/vercel/__tests__/setup-jest.ts',
      ],
      displayName: 'shopify-app-remix-server-vercel',
      testEnvironment: 'node',
      testPathIgnorePatterns: ['src/react', 'src/server/adapters/__tests__'],
    },
    {
      ...project,
      testRegex: undefined,
      displayName: 'shopify-app-remix-server-adapters',
      testMatch: ['<rootDir>/src/server/adapters/__tests__/**/*'],
      testEnvironment: 'node',
    },
  ];
}
