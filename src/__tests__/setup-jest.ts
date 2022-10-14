import fetchMock from 'jest-fetch-mock';

// Globally disable fetch requests so we don't risk making real ones
fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.mockReset();
});

// Globally block using console.warn and console.error so we don't silently ignore these
jest.spyOn(global.console, 'warn').mockImplementation((message) => {
  throw new Error(`Test ran console.warn, which is not allowed:\n${message}`);
});
jest.spyOn(global.console, 'error').mockImplementation((message) => {
  throw new Error(`Test ran console.error, which is not allowed:\n${message}`);
});
