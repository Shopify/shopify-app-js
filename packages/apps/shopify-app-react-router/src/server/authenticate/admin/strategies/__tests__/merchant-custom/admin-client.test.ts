import {
  ApiVersion,
  Session,
  ShopifyError,
} from '@shopify/shopify-api';

import {AdminApiContext} from '../../../../../clients';
import {shopifyApp} from '../../../../..';
import {
  APP_URL,
  TEST_SHOP,
  expectAdminApiClient,
  getThrownError,
  mockGraphqlRequest,
  setupValidCustomAppSession,
  testConfig,
} from '../../../../../__test-helpers';
import {AppDistribution} from '../../../../../types';

describe('admin.authenticate context', () => {
  expectAdminApiClient(async () => {
    const {
      admin,
      expectedSession,
      session: actualSession,
    } = await setUpMerchantCustomFlow();

    return {admin, expectedSession, actualSession};
  });
  
  describe.each([
    {
      testGroup: 'GraphQL client',
      mockRequest: mockGraphqlRequest(),
      action: async (admin: AdminApiContext, _session: Session) =>
        admin.graphql('{ shop { name } }'),
    },
    {
      testGroup: 'GraphQL client with options',
      mockRequest: mockGraphqlRequest('2021-01' as ApiVersion),
      action: async (admin: AdminApiContext, _session: Session) =>
        admin.graphql(
          'mutation myMutation($ID: String!) { shop(ID: $ID) { name } }',
          {
            variables: {ID: '123'},
            apiVersion: '2021-01' as ApiVersion,
            headers: {custom: 'header'},
            tries: 2,
          },
        ),
    },
  ])(
    '$testGroup re-authentication',
    ({testGroup: _testGroup, mockRequest, action}) => {
      it('throws a Shopify Error when receives a 401 response on fetch requests', async () => {
        // GIVEN
        const {admin, session} = await setUpMerchantCustomFlow();
        const requestMock = await mockRequest({status: 401});

        // WHEN
        const error = await getThrownError(
          async () => action(admin, session),
          requestMock,
        );

        // THEN
        expect(error).toBeInstanceOf(ShopifyError);
      });
    },
  );
});

async function setUpMerchantCustomFlow() {
  const shopify = shopifyApp(
    testConfig({
      isEmbeddedApp: false,
      distribution: AppDistribution.ShopifyAdmin,
      adminApiAccessToken: 'test-token',
    }),
  );

  const expectedSession = setupValidCustomAppSession(TEST_SHOP);

  const request = new Request(`${APP_URL}?shop=${TEST_SHOP}`);

  return {
    shopify,
    expectedSession,
    ...(await shopify.authenticate.admin(request)),
  };
}
