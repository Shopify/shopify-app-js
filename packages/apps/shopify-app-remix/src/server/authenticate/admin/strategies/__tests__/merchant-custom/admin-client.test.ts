import {restResources} from '@shopify/shopify-api/rest/admin/2023-04';
import {ApiVersion, LATEST_API_VERSION, Session} from '@shopify/shopify-api';

import {AppDistribution} from '../../../../../types';
import {AdminApiContext} from '../../../../../clients';
import {shopifyApp} from '../../../../..';
import {
  APP_URL,
  TEST_SHOP,
  expectAdminApiClient,
  getThrownResponse,
  mockExternalRequest,
  setupValidCustomAppSession,
  testConfig,
} from '../../../../../__test-helpers';

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
      testGroup: 'REST client',
      mockRequest: mockRestRequest,
      action: async (admin: AdminApiContext, _session: Session) =>
        admin.rest.get({path: '/customers.json'}),
    },
    {
      testGroup: 'REST resources',
      mockRequest: mockRestRequest,
      action: async (admin: AdminApiContext, session: Session) =>
        admin.rest.resources.Customer.all({session}),
    },
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
      it('returns 401 when receives a 401 response on fetch requests', async () => {
        // GIVEN
        const {admin, session} = await setUpMerchantCustomFlow();
        const requestMock = await mockRequest();

        // WHEN
        const response = await getThrownResponse(
          async () => action(admin, session),
          requestMock,
        );

        // THEN
        expect(response.status).toEqual(401);
        expect(
          response.headers.get('X-Shopify-Retry-Invalid-Session-Request'),
        ).toBeNull();
      });
    },
  );
});

async function setUpMerchantCustomFlow() {
  const shopify = shopifyApp(
    testConfig({
      restResources,
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

async function mockRestRequest(status = 401) {
  const requestMock = new Request(
    `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/customers.json`,
  );

  await mockExternalRequest({
    request: requestMock,
    response: new Response('{}', {status}),
  });

  return requestMock;
}

function mockGraphqlRequest(apiVersion = LATEST_API_VERSION) {
  return async function (status = 401) {
    const requestMock = new Request(
      `https://${TEST_SHOP}/admin/api/${apiVersion}/graphql.json`,
      {method: 'POST'},
    );

    await mockExternalRequest({
      request: requestMock,
      response: new Response(undefined, {status}),
    });

    return requestMock;
  };
}
