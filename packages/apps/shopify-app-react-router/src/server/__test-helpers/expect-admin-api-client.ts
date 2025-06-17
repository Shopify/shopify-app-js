import {Session} from '@shopify/shopify-api';

import {LATEST_API_VERSION} from '..';
import type {AdminApiContext} from '../clients';

import {TEST_SHOP} from './const';
import {mockExternalRequest} from './request-mock';

export function expectAdminApiClient(
  factory: () => Promise<{
    admin: AdminApiContext;
    expectedSession: Session;
    actualSession: Session;
  }>,
) {
  describe('Graphql client', () => {
    it('can perform requests', async () => {
      // GIVEN
      const {admin, actualSession} = await factory();
      await mockExternalRequest({
        request: new Request(
          `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/graphql.json`,
          {
            method: 'POST',
            headers: {'X-Shopify-Access-Token': actualSession.accessToken!},
          },
        ),
        response: new Response(
          JSON.stringify({data: {shop: {name: 'Test shop'}}}),
        ),
      });

      // WHEN
      const response = await admin.graphql('{ shop { name } }');

      // THEN
      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({
        data: {shop: {name: 'Test shop'}},
        headers: {'Content-Type': ['application/json']},
      });
    });

    it('returns a session object as part of the context', async () => {
      // GIVEN
      const {expectedSession, actualSession} = await factory();

      // THEN
      expect(expectedSession).toEqual(actualSession);
    });
  });
}
