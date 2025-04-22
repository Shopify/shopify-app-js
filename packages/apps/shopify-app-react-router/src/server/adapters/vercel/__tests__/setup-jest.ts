import fetchMock from 'jest-fetch-mock';
import '@shopify/shopify-api/adapters/web-api';
import '..';
import {setAbstractFetchFunc} from '@shopify/shopify-api/runtime';

// Globally disable fetch requests so we don't risk making real ones
fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.mockReset();
});
setAbstractFetchFunc(fetch);
