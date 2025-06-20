import {ApiVersion, HttpMaxRetriesError, Session} from '@shopify/shopify-api';

import {
  expectAdminApiClient,
  getThrownResponse,
  mockGraphqlRequest,
  setUpEmbeddedFlow,
  setUpNonEmbeddedFlow,
} from '../../../__test-helpers';
import {AdminApiContext} from '../../../clients';

describe('admin.authenticate context', () => {
  expectAdminApiClient(async () => {
    const {
      admin,
      expectedSession,
      session: actualSession,
    } = await setUpEmbeddedFlow();

    return {admin, expectedSession, actualSession};
  });

  it('re-throws errors other than HttpResponseErrors on GraphQL requests', async () => {
    // GIVEN
    const {admin} = await setUpEmbeddedFlow();

    // WHEN
    await mockGraphqlRequest()({status: 429});
    await mockGraphqlRequest()({status: 429});

    // THEN
    await expect(async () =>
      admin.graphql(
        'mutation myMutation($ID: String!) { shop(ID: $ID) { name } }',
        {variables: {ID: '123'}, tries: 2},
      ),
    ).rejects.toThrowError(HttpMaxRetriesError);
  });

  it('respects the abort signal', async () => {
    // GIVEN
    const {admin} = await setUpEmbeddedFlow();
    const controller = new AbortController();
    await mockGraphqlRequest()({status: 200});

    // Abort the request immediately
    controller.abort();

    // WHEN/THEN
    await expect(
      admin.graphql('{ shop { name } }', {signal: controller.signal}),
    ).rejects.toThrowError(Error);
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
      it('throws a response when GraphQL request receives a non-401 response and not embedded', async () => {
        // GIVEN
        const {admin, session} = await setUpNonEmbeddedFlow();
        const requestMock = await mockRequest({status: 403});

        // WHEN
        const response = await getThrownResponse(
          async () => action(admin, session),
          requestMock,
        );

        // THEN
        expect(response.status).toEqual(403);
      });
    },
  );
});
