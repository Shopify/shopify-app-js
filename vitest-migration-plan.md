# Vitest Migration Plan

## Why

Jest 30 + ts-jest works, but Vitest offers faster startup (no ts-jest compile step),
native ESM, first-class TypeScript without a transformer, and better watch mode DX.
This plan migrates all 26 packages in the monorepo from Jest to Vitest.

## Current state

- **Test runner**: Jest 30 + ts-jest (ESM preset)
- **25 jest.config.ts files** across the monorepo
- **3 test environments**: `node` (most packages), `jsdom` (Remix/React Router React
  components), `miniflare` (CF Worker + Web API adapters in shopify-api)
- **7 Jest projects** inside shopify-api (library, rest_resources, adapters.mock,
  adapters.node, adapters.cf-worker, adapters.web-api, test_helpers)
- **Custom matchers** in `packages/apps/shopify-api/lib/setup-jest.ts`
- **Global fetch mock** via `jest-fetch-mock` in `config/tests/setup-jest.ts`

## Key technical decisions

| Decision | Choice | Rationale |
|---|---|---|
| TypeScript transform | Vitest native (esbuild) | Replaces ts-jest; no config needed |
| JSX transform | `@vitejs/plugin-react` | Replaces babel-jest in Remix/React Router |
| CF Worker environment | `@cloudflare/vitest-pool-workers` | Official Cloudflare replacement for `jest-environment-miniflare`; runs tests in actual workerd runtime |
| jest.* API calls | Full find-replace to vi.* | ~200 occurrences; cleaner long-term than a shim |
| jest-fetch-mock | Keep (Vitest-compatible) | No changes needed; migrate to MSW separately if desired |
| globals | `globals: true` in vitest configs | Keeps `describe`/`it`/`expect`/`beforeEach` as globals; `vi` must be imported explicitly |
| Multi-project (shopify-api) | Vitest workspace mode | `defineWorkspace()` replaces Jest `projects:` array |

## Worktree workflow (recommended for parallel work)

Each phase is independent enough to be worked on simultaneously. Use a git worktree
per phase so multiple phases can progress in parallel without conflicts.

### Setup

```bash
# Phase 1
git worktree add /tmp/vitest-phase1 -b chore/vitest-phase1

# Phase 2 (can start in parallel with Phase 1)
git worktree add /tmp/vitest-phase2 -b chore/vitest-phase2

# Phase 3 (can start after shared infra is merged or cherry-picked)
git worktree add /tmp/vitest-phase3 -b chore/vitest-phase3
```

All subsequent per-phase commands use the worktree path rather than `cd`:

```bash
# Install in a worktree
pnpm install --dir /tmp/vitest-phase1

# Run tests in a worktree
pnpm --dir /tmp/vitest-phase1 test:ci --filter='./packages/api-clients/*'
```

Phase 4 (cleanup) should run after the other phases are merged to avoid conflicts.

## API changes required in test files

A codemod / find-replace pass is needed across all test files before or alongside each phase:

| Jest | Vitest | Notes |
|---|---|---|
| `jest.fn()` | `vi.fn()` | |
| `jest.mock(...)` | `vi.mock(...)` | hoisting behaviour is identical |
| `jest.spyOn(...)` | `vi.spyOn(...)` | |
| `jest.resetAllMocks()` | `vi.resetAllMocks()` | same semantics |
| `jest.restoreAllMocks()` | `vi.restoreAllMocks()` | same name |
| `jest.clearAllMocks()` | `vi.clearAllMocks()` | same semantics |
| `jest.useFakeTimers()` | `vi.useFakeTimers()` | |
| `jest.useRealTimers()` | `vi.useRealTimers()` | |
| `jest.setTimeout(n)` | move to `test: { testTimeout: n }` in config | |
| `jest.requireActual(m)` | `await vi.importActual(m)` | **async** in Vitest — requires surrounding function to be async |
| `(fn as jest.Mock)` | `(fn as Mock)` + `import { Mock } from 'vitest'` | type only |
| `import type { Mock } from 'jest'` | `import type { Mock } from 'vitest'` | |

Add `import { vi } from 'vitest'` to any file that uses `vi.*` (or enable
`globals: true` + `/// <reference types="vitest/globals" />` for full IDE support).

## Shared infrastructure (do this first)

### New: `config/tests/vitest.config.ts`
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    setupFiles: [`${__dirname}/setup-vitest.ts`],
  },
})
```

### New: `config/tests/setup-vitest.ts`
```ts
import fetchMock from 'jest-fetch-mock'

// Node 20+ has TextEncoder/TextDecoder natively — no polyfill needed

fetchMock.enableMocks()

beforeEach(() => {
  fetchMock.mockReset()
})
```

### Root `package.json` — add devDependencies
```
vitest
@vitest/coverage-v8
@cloudflare/vitest-pool-workers   (for shopify-api CF worker tests)
@vitejs/plugin-react               (for Remix/React Router JSX)
```

Remove after all packages are migrated:
```
jest  @jest/types  @types/jest  ts-jest
jest-environment-jsdom  eslint-plugin-jest
```
(Keep `jest-fetch-mock` — it is Vitest-compatible.)

Also remove the `resolutions`/`overrides` entries for `jest` and `jest-circus`.

---

## Phase 1 — Simple packages (lowest risk)

> **Worktree:** `/tmp/vitest-phase1` (branch `chore/vitest-phase1`)

**Packages** (15 total):
- `packages/api-clients/admin-api-client`
- `packages/api-clients/graphql-client`
- `packages/api-clients/storefront-api-client`
- `packages/api-clients/api-codegen-preset`
- `packages/apps/shopify-app-express`
- All 11 `packages/apps/session-storage/*` packages

**Per-package changes:**

1. Delete `jest.config.ts`
2. Create `vitest.config.ts`:
   ```ts
   import { mergeConfig } from 'vitest/config'
   import baseConfig from '../../../../config/tests/vitest.config'

   export default mergeConfig(baseConfig, {
     test: {
       // session-storage packages only:
       testTimeout: 30000,  // use the existing value from jest.config.ts
     },
   })
   ```
   (Path depth to `config/tests/` varies per package; adjust accordingly.)
3. Update `package.json` scripts:
   ```json
   "test": "vitest run",
   "test:ci": "vitest run"
   ```
4. Apply the jest→vi find-replace pass to all `.test.ts` files in the package.

---

## Phase 2 — shopify-api (multi-project + CF Workers)

> **Worktree:** `/tmp/vitest-phase2` (branch `chore/vitest-phase2`)

This is the most complex package. Jest's `projects:` array is replaced by Vitest's
workspace mode.

### Directory structure change

```
Old: lib/__tests__/jest_projects/*.jest.config.ts
New: lib/__tests__/vitest_projects/*.vitest.config.ts
```

### New: `packages/apps/shopify-api/vitest.config.ts`
```ts
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  './lib/__tests__/vitest_projects/library.vitest.config.ts',
  './lib/__tests__/vitest_projects/rest_resources.vitest.config.ts',
  './lib/__tests__/vitest_projects/adapters.mock.vitest.config.ts',
  './lib/__tests__/vitest_projects/adapters.node.vitest.config.ts',
  './lib/__tests__/vitest_projects/adapters.cf-worker.vitest.config.ts',
  './lib/__tests__/vitest_projects/adapters.web-api.vitest.config.ts',
  './lib/__tests__/vitest_projects/test_helpers.vitest.config.ts',
])
```

### Non-worker sub-configs (library, rest_resources, adapters.mock, adapters.node, test_helpers)

```ts
// Example: library.vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'library',
    globals: true,
    environment: 'node',
    root: '../../',                          // matches old rootDir
    setupFiles: ['<rootDir>/setup-vitest.ts'],
    include: ['**/*.test.ts'],
  },
})
```

Each sub-config sets `name:` (was `displayName:`), `root:` (was `rootDir:`), and
`setupFiles:` (was `setupFilesAfterEnv:`).

### CF Worker sub-configs (adapters.cf-worker, adapters.web-api)

Both currently use `testEnvironment: 'miniflare'`. Replace with
`@cloudflare/vitest-pool-workers`:

```ts
// adapters.cf-worker.vitest.config.ts
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
  test: {
    name: 'adapters:cf-worker',
    root: '../../../adapters/cf-worker',
    include: ['**/*.test.ts'],
    poolOptions: {
      workers: {
        miniflare: {
          // Add any binding configuration that was previously in
          // jest-environment-miniflare environmentOptions
        },
      },
    },
  },
})
```

```ts
// adapters.web-api.vitest.config.ts
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
  test: {
    name: 'adapters:web-api',
    root: '../../../adapters/web-api',
    include: ['**/*.test.ts'],
    poolOptions: {
      workers: {
        miniflare: {},
      },
    },
  },
})
```

### Custom matchers

`lib/setup-jest.ts` → `lib/setup-vitest.ts`. No API changes needed;
`expect.extend()` is identical in Vitest.

```ts
// lib/setup-vitest.ts
import { compare } from 'compare-versions'
import '../adapters/mock'
import { SHOPIFY_API_LIBRARY_VERSION } from './version'
import { toMatchMadeHttpRequest } from './__test-helpers__'

expect.extend({
  toMatchMadeHttpRequest,
  toBeWithinSecondsOf(received, compareDate, seconds) { /* unchanged */ },
  toBeWithinDeprecationSchedule(version) { /* unchanged */ },
})
```

Update each sub-config's `setupFiles` to point at `setup-vitest.ts` instead of
`setup-jest.ts`.

### Test file changes

Apply the jest→vi find-replace pass to all `.test.ts` files under
`packages/apps/shopify-api`.

---

## Phase 3 — shopify-app-remix + shopify-app-react-router

> **Worktree:** `/tmp/vitest-phase3` (branch `chore/vitest-phase3`)

Both packages use multi-project configs with `jsdom` for React component tests and
`node` for server tests.

### New: `vitest.config.ts` (example for shopify-app-remix)

```ts
import { defineWorkspace } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineWorkspace([
  {
    // React component tests
    plugins: [react()],
    test: {
      name: 'shopify-app-remix-react',
      globals: true,
      environment: 'jsdom',
      include: ['src/react/**/*.test.{ts,tsx}'],
      setupFiles: ['<rootDir>/../../../config/tests/setup-vitest.ts'],
    },
  },
  {
    // Server/Node tests
    test: {
      name: 'shopify-app-remix-server-node',
      globals: true,
      environment: 'node',
      include: ['src/server/**/*.test.ts'],
      exclude: ['src/server/adapters/__tests__/**'],
      setupFiles: [
        '<rootDir>/../../../config/tests/setup-vitest.ts',
        '<rootDir>/src/server/adapters/node/__tests__/setup-vitest.ts',
      ],
    },
  },
  {
    test: {
      name: 'shopify-app-remix-server-vercel',
      globals: true,
      environment: 'node',
      include: ['src/server/**/*.test.ts'],
      exclude: ['src/server/adapters/__tests__/**'],
      setupFiles: [
        '<rootDir>/../../../config/tests/setup-vitest.ts',
        '<rootDir>/src/server/adapters/vercel/__tests__/setup-vitest.ts',
      ],
    },
  },
  {
    test: {
      name: 'shopify-app-remix-server-adapters',
      globals: true,
      environment: 'node',
      root: './src/server/adapters',
      include: ['**/*.test.ts'],
    },
  },
])
```

Replace `transformIgnorePatterns` for `@web3-storage` with Vitest's equivalent:
```ts
server: {
  deps: {
    inline: ['@web3-storage'],
  },
},
```

Apply the jest→vi find-replace pass to all test files.

---

## Phase 4 — Cleanup

Once all packages pass CI with Vitest (Phases 1–3 merged):

1. Delete all `jest.config.ts` files (25 files)
2. Remove from root `package.json` devDependencies:
   `jest`, `@jest/types`, `@types/jest`, `ts-jest`, `jest-environment-jsdom`,
   `eslint-plugin-jest`
3. Remove `resolutions`/`overrides` entries for `jest` and `jest-circus`
4. Add `@vitest/eslint-plugin` to ESLint config; remove `eslint-plugin-jest`
5. Update `tsconfig.base.json`: remove `"jest"` from `compilerOptions.types`
6. Update `turbo.json` if any task names change (likely no change needed)
7. CI (`.github/workflows/ci.yml`): no structural changes needed — test commands
   run through `pnpm test:ci --filter=...` which calls each package's npm script

---

## Verification

After each phase, the migrated packages must pass:

```bash
# Phase 1
pnpm --dir /tmp/vitest-phase1 test:ci --filter='./packages/api-clients/*'
pnpm --dir /tmp/vitest-phase1 test:ci --filter='./packages/apps/shopify-app-express'
pnpm --dir /tmp/vitest-phase1 test:ci --filter='./packages/apps/session-storage/*'

# Phase 2
pnpm --dir /tmp/vitest-phase2 test:ci --filter='./packages/apps/shopify-api'

# Phase 3
pnpm --dir /tmp/vitest-phase3 test:ci --filter='./packages/apps/shopify-app-remix'
pnpm --dir /tmp/vitest-phase3 test:ci --filter='./packages/apps/shopify-app-react-router'
```

Full CI (all Node matrix versions 20.10.0, 22, 24) must pass before cleanup in Phase 4.
