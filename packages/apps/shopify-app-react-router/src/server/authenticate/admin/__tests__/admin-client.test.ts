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
});
