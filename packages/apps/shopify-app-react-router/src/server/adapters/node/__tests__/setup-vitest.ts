import fetchMock from 'jest-fetch-mock';
import '@shopify/shopify-api/adapters/web-api';
import '..';

// Globally disable fetch requests so we don't risk making real ones
fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.mockReset();
});
