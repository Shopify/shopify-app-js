import {vi, type Mock} from 'vitest';
import {createGraphQLClient} from '@shopify/graphql-client';

import {createStorefrontApiClient} from '../../storefront-api-client';

import {mockApiVersions, graphqlClientMock, config} from './fixtures';

vi.mock('@shopify/graphql-client', async () => {
  return {
    ...(await vi.importActual('@shopify/graphql-client')),
    createGraphQLClient: vi.fn(),
    getCurrentSupportedAPIVersions: () => mockApiVersions,
  };
});

describe('Storefront API Client: Browser', () => {
  describe('createStorefrontApiClient()', () => {
    beforeEach(() => {
      (createGraphQLClient as Mock).mockReturnValue(graphqlClientMock);
    });

    afterEach(() => {
      vi.resetAllMocks();
      vi.restoreAllMocks();
    });

    describe('client initialization', () => {
      describe('validations', () => {
        it('throws an error when a private access token is provided in a browser environment', () => {
          expect(() =>
            createStorefrontApiClient({
              ...config,
              publicAccessToken: undefined as any,
              privateAccessToken: 'private-access-token',
            }),
          ).toThrow(
            new Error(
              'Storefront API Client: private access tokens and headers should only be used in a server-to-server implementation. Use the public API access token in nonserver environments.',
            ),
          );
        });
      });
    });
  });
});
