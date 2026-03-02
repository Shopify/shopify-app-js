import {vi} from 'vitest';

// jsdom does not expose TextEncoder/TextDecoder; install them from Node's built-ins.
// Use Object.defineProperty so this works even if the property has been defined
// as non-writable or as a getter by jsdom.
const {TextEncoder: NodeTextEncoder, TextDecoder: NodeTextDecoder} =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('util') as typeof import('util');
Object.defineProperty(globalThis, 'TextEncoder', {
  value: NodeTextEncoder,
  configurable: true,
  writable: true,
});
Object.defineProperty(globalThis, 'TextDecoder', {
  value: NodeTextDecoder,
  configurable: true,
  writable: true,
});

// jest-fetch-mock uses jest.fn() at module init time.
// Set the jest global before dynamically importing it so the module loads cleanly.
Object.assign(globalThis, {jest: vi});

const {enableFetchMocks} = await import('jest-fetch-mock');

enableFetchMocks();
