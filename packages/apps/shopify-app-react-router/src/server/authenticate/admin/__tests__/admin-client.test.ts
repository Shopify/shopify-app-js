import {HttpMaxRetriesError} from '@shopify/shopify-api';

import {
  expectAdminApiClient,
  mockGraphqlRequest,
  setUpEmbeddedFlow,
} from '../../../__test-helpers';

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

  it('passes abort signal through to fetch request', async () => {
    // GIVEN
    const {admin} = await setUpEmbeddedFlow();
    const controller = new AbortController();

    // Mock the GraphQL response
    await mockGraphqlRequest()({
      status: 200,
      responseContent: JSON.stringify({data: {shop: {name: 'Test Shop'}}}),
    });

    // WHEN
    await admin.graphql('{ shop { name } }', {signal: controller.signal});

    // THEN - Verify fetch was called with the signal
    expect(fetchMock.mock.calls).toHaveLength(1);
    const [_url, options] = fetchMock.mock.calls[0];
    expect(options).toBeDefined();
    expect(options!.signal).toBe(controller.signal);
  });
});
