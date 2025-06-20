import {ApiVersion, Session} from '@shopify/shopify-api';

import {AdminApiContext} from '../../../../../clients';
import {shopifyApp} from '../../../../..';
import {
  APP_URL,
  BASE64_HOST,
  TEST_SHOP,
  expectAdminApiClient,
  getJwt,
  getThrownResponse,
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
      it('redirects to exit bounce page when document request receives a 401 response', async () => {
        // GIVEN
        const {admin, session, shopify} = await setUpDocumentFlow();
        const requestMock = await mockRequest({status: 401});

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
        const {admin, session, shopify} = await setUpFetchFlow();
        const requestMock = await mockRequest({status: 401});

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
  const config = testConfig();

  const shopify = shopifyApp(config);
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
