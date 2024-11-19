import {Session} from '@shopify/shopify-api';

import {LATEST_API_VERSION} from '..';
import type {
  AdminApiContextWithoutRest,
  AdminApiContextWithRest,
} from '../clients';

import {TEST_SHOP} from './const';
import {mockExternalRequest} from './request-mock';

const REQUEST_URL = `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/customers.json`;

export function expectAdminApiClient(
  factory: () => Promise<{
    admin: AdminApiContextWithRest;
    adminWithoutRest?: AdminApiContextWithoutRest;
    expectedSession: Session;
    actualSession: Session;
  }>,
) {
  describe('when future.removeRest is falsey there is a REST client', () => {
    it('can perform GET requests', async () => {
      // GIVEN
      const {admin} = await factory();
      await mockExternalRequest({
        request: new Request(REQUEST_URL),
        response: new Response(JSON.stringify({customers: []})),
      });

      // WHEN
      const response = await admin.rest.get({path: 'customers'});

      // THEN
      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({customers: []});
    });

    it('can perform POST requests', async () => {
      // GIVEN
      const {admin} = await factory();
      await mockExternalRequest({
        request: new Request(REQUEST_URL, {method: 'POST'}),
        response: new Response(JSON.stringify({customers: []})),
      });

      // WHEN
      const response = await admin.rest.post({
        path: '/customers.json',
        data: '',
      });

      // THEN
      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({customers: []});
    });

    it('can perform PUT requests', async () => {
      // GIVEN
      const {admin} = await factory();
      await mockExternalRequest({
        request: new Request(REQUEST_URL, {method: 'PUT'}),
        response: new Response(JSON.stringify({customers: []})),
      });

      // WHEN
      const response = await admin.rest.put({
        path: '/customers.json',
        data: '',
      });

      // THEN
      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({customers: []});
    });

    it('can perform DELETE requests', async () => {
      // GIVEN
      const {admin} = await factory();
      await mockExternalRequest({
        request: new Request(REQUEST_URL, {method: 'DELETE'}),
        response: new Response(JSON.stringify({customers: []})),
      });

      // WHEN
      const response = await admin.rest.delete({path: '/customers.json'});

      // THEN
      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({customers: []});
    });
  });

  describe('when future.removeRest is truthy', () => {
    it('does not include a rest property on the admin object', async () => {
      // GIVEN
      const {adminWithoutRest} = await factory();

      // THEN
      expect(adminWithoutRest).not.toHaveProperty('rest');
    });
  });

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
