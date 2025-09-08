import {TextEncoder, TextDecoder} from 'util';

import fetchMock from 'jest-fetch-mock';

// Polyfill for TextEncoder/TextDecoder which are needed by react-router
// but not available in Node.js test environment
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder as any;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as any;
}

// Globally disable fetch requests so we don't risk making real ones
fetchMock.enableMocks();

// Define the global variable that Rolldown replaces during build
// @ts-expect-error - This will be replaced by Rolldown at build time
global.ROLLDOWN_REPLACE_CLIENT_VERSION = 'test-version';

beforeEach(() => {
  fetchMock.mockReset();
});
