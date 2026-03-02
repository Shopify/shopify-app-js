import {defineWorkspace} from 'vitest/config';

export default defineWorkspace([
  './lib/__tests__/vitest_projects/library.vitest.config.ts',
  './lib/__tests__/vitest_projects/rest_resources.vitest.config.ts',
  './lib/__tests__/vitest_projects/adapters.mock.vitest.config.ts',
  './lib/__tests__/vitest_projects/adapters.node.vitest.config.ts',
  './lib/__tests__/vitest_projects/adapters.cf-worker.vitest.config.ts',
  './lib/__tests__/vitest_projects/adapters.web-api.vitest.config.ts',
  './lib/__tests__/vitest_projects/test_helpers.vitest.config.ts',
]);
