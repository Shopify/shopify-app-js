import {Session} from '@shopify/shopify-api';

import {LATEST_API_VERSION} from '..';
import type {StorefrontContext} from '../clients';

import {mockExternalRequest} from './request-mock';
import {TEST_SHOP} from './const';

export function expectStorefrontApiClient(
  factory: () => Promise<{
    storefront: StorefrontContext;
    expectedSession: Session;
    actualSession: Session;
  }>,
) {
  it('Storefront client can perform GraphQL Requests', async () => {
    // GIVEN
    const {storefront, actualSession} = await factory();
    const apiResponse = {data: {blogs: {nodes: [{id: 1}]}}, headers: {}};
    await mockExternalRequest({
      request: new Request(
        `https://${TEST_SHOP}/api/${LATEST_API_VERSION}/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Shopify-Storefront-Private-Token': actualSession.accessToken!,
          },
        },
      ),
      response: new Response(JSON.stringify(apiResponse)),
    });

    // WHEN
    const response = await storefront.graphql(
      'blogs(first: 1) { nodes { id }}',
    );

    // THEN
    expect(response.status).toEqual(200);
    expect(await response.json()).toEqual(apiResponse);
  });

  it('Storefront client uses the correct session', async () => {
    // GIVEN
    const {expectedSession, actualSession} = await factory();

    // THEN
    expect(expectedSession).toEqual(actualSession);
  });
}
