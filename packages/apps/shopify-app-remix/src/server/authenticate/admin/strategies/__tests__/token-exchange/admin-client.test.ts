import {ApiVersion, LATEST_API_VERSION, Session} from '@shopify/shopify-api';
import {restResources} from '@shopify/shopify-api/rest/admin/2023-04';

import {AdminApiContextWithRest} from '../../../../../clients';
import {shopifyApp} from '../../../../..';
import {
  APP_URL,
  BASE64_HOST,
  TEST_SHOP,
  expectAdminApiClient,
  getJwt,
  getThrownResponse,
  mockExternalRequest,
  mockGraphqlRequest,
  setUpFetchFlow,
  setUpValidSession,
  testConfig,
} from '../../../../../__test-helpers';

describe('admin.authenticate context', () => {
  expectAdminApiClient(async () => {
    const {
      admin,
      expectedSession,
      session: actualSession,
    } = await setUpDocumentFlow();

    const {admin: adminWithoutRest} =
      await setUpDocumentFlowWithRemoveRestFlag();

    return {admin, adminWithoutRest, expectedSession, actualSession};
  });
  describe.each([
    {
      testGroup: 'REST client',
      mockRequest: mockRestRequest,
      action: async (admin: AdminApiContextWithRest, _session: Session) =>
        admin.rest.get({path: '/customers.json'}),
    },
    {
      testGroup: 'REST resources',
      mockRequest: mockRestRequest,
      action: async (admin: AdminApiContextWithRest, session: Session) =>
        admin.rest.resources.Customer.all({session}),
    },
    {
      testGroup: 'GraphQL client',
      mockRequest: mockGraphqlRequest(),
      action: async (admin: AdminApiContextWithRest, _session: Session) =>
        admin.graphql('{ shop { name } }'),
    },
    {
      testGroup: 'GraphQL client with options',
      mockRequest: mockGraphqlRequest('2021-01' as ApiVersion),
      action: async (admin: AdminApiContextWithRest, _session: Session) =>
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
      it('redirects to exit bounce page when document request receives a 401 response', async () => {
        // GIVEN
        const {admin, session, shopify} = await setUpDocumentFlow();
        const requestMock = await mockRequest();

        // WHEN
        const response = await getThrownResponse(
          async () => action(admin, session),
          requestMock,
        );

        // THEN
        expect(response.status).toBe(302);

        const {pathname} = new URL(response.headers.get('location')!, APP_URL);
        expect(pathname).toBe('/auth/session-token');

        const modifiedSession = await shopify.sessionStorage.loadSession(
          session.id,
        );

        expect(modifiedSession).toBeDefined();
        expect(modifiedSession!.accessToken).toBeUndefined();
      });

      it('returns 401 when receives a 401 response on fetch requests', async () => {
        // GIVEN
        const {admin, session, shopify} = await setUpFetchFlow({
          unstable_newEmbeddedAuthStrategy: true,
        });
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

        const modifiedSession = await shopify.sessionStorage.loadSession(
          session.id,
        );

        expect(modifiedSession).toBeDefined();
        expect(modifiedSession!.accessToken).toBeUndefined();
      });
    },
  );
});

async function setUpDocumentFlow() {
  const config = testConfig({
    restResources,
  });

  const shopify = shopifyApp({
    ...config,
    future: {
      ...config.future,
      unstable_newEmbeddedAuthStrategy: true,
      removeRest: false,
    },
  });
  const expectedSession = await setUpValidSession(shopify.sessionStorage);

  const {token} = getJwt();
  const request = new Request(
    `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
  );

  return {
    shopify,
    expectedSession,
    ...(await shopify.authenticate.admin(request)),
  };
}

async function setUpDocumentFlowWithRemoveRestFlag() {
  const config = testConfig({
    restResources,
  });

  const shopify = shopifyApp({
    ...config,
    future: {
      ...config.future,
      unstable_newEmbeddedAuthStrategy: true,
      removeRest: true,
    },
  });

  const {token} = getJwt();
  const request = new Request(
    `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
  );

  return shopify.authenticate.admin(request);
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
