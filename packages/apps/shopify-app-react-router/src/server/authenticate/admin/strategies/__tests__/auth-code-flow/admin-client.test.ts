import {ApiVersion, Session} from '@shopify/shopify-api';

import {AdminApiContext} from '../../../../../clients';
import {
  APP_URL,
  TEST_SHOP,
  expectAdminApiClient,
  expectExitIframeRedirect,
  getThrownResponse,
  mockGraphqlRequest,
  setUpEmbeddedFlow,
  setUpFetchFlow,
  setUpNonEmbeddedFlow,
} from '../../../../../__test-helpers';
import {REAUTH_URL_HEADER} from '../../../../const';

describe('admin.authenticate context', () => {
  expectAdminApiClient(async () => {
    const {
      admin,
      expectedSession,
      session: actualSession,
    } = await setUpEmbeddedFlow();

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
      it('redirects to auth when request receives a 401 response and not embedded', async () => {
        // GIVEN
        const {admin, session} = await setUpNonEmbeddedFlow();
        const requestMock = await mockRequest({status: 401});

        // WHEN
        const response = await getThrownResponse(
          async () => action(admin, session),
          requestMock,
        );

        // THEN
        expect(response.status).toEqual(302);

        const {hostname, pathname} = new URL(response.headers.get('Location')!);
        expect(hostname).toEqual(TEST_SHOP);
        expect(pathname).toEqual('/admin/oauth/authorize');
      });

      it('redirects to exit iframe when request receives a 401 response and embedded', async () => {
        // GIVEN
        const {admin, session} = await setUpEmbeddedFlow();
        const requestMock = await mockRequest({status: 401});

        // WHEN
        const response = await getThrownResponse(
          async () => action(admin, session),
          requestMock,
        );

        // THEN
        expectExitIframeRedirect(response);
      });

      it('returns app bridge redirection headers when request receives a 401 response on fetch requests', async () => {
        // GIVEN
        const {admin, session} = await setUpFetchFlow({
          unstable_newEmbeddedAuthStrategy: false,
        });
        const requestMock = await mockRequest({status: 401});

        // WHEN
        const response = await getThrownResponse(
          async () => action(admin, session),
          requestMock,
        );

        // THEN
        expect(response.status).toEqual(401);

        const {origin, pathname, searchParams} = new URL(
          response.headers.get(REAUTH_URL_HEADER)!,
        );
        expect(origin).toEqual(APP_URL);
        expect(pathname).toEqual('/auth');
        expect(searchParams.get('shop')).toEqual(TEST_SHOP);
      });
    },
  );
});
