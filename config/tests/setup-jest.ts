import fetchMock from 'jest-fetch-mock';

// Add polyfills for TextEncoder/TextDecoder which are missing in JSDOM
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {TextEncoder, TextDecoder} = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Globally disable fetch requests so we don't risk making real ones
fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.mockReset();
});
