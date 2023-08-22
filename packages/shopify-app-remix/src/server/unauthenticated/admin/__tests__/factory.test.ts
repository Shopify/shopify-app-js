import {LATEST_API_VERSION} from '@shopify/shopify-api';

import {shopifyApp} from '../../../index';
import {mockExternalRequest} from '../../../__tests__/request-mock';
import {
  TEST_SHOP,
  setUpValidSession,
  testConfig,
} from '../../../__tests__/test-helper';

const REQUEST_URL = `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/customers.json`;

describe('unauthenticated admin context', () => {
  it('REST client can perform GET requests', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    await setUpValidSession(shopify.sessionStorage, false);
    const {admin} = await shopify.unauthenticated.admin(TEST_SHOP);

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

  it('REST client can perform POST requests', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    await setUpValidSession(shopify.sessionStorage, false);
    const {admin} = await shopify.unauthenticated.admin(TEST_SHOP);

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

  it('REST client can perform PUT requests', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    await setUpValidSession(shopify.sessionStorage, false);
    const {admin} = await shopify.unauthenticated.admin(TEST_SHOP);

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

  it('REST client can perform DELETE requests', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    await setUpValidSession(shopify.sessionStorage, false);
    const {admin} = await shopify.unauthenticated.admin(TEST_SHOP);

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

  it('GraphQL client can perform requests', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const session = await setUpValidSession(shopify.sessionStorage, false);
    const {admin} = await shopify.unauthenticated.admin(TEST_SHOP);

    await mockExternalRequest({
      request: new Request(
        `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/graphql.json`,
        {
          method: 'POST',
          headers: {'X-Shopify-Access-Token': session.accessToken!},
        },
      ),
      response: new Response(JSON.stringify({shop: {name: 'Test shop'}})),
    });

    // WHEN
    const response = await admin.graphql('{ shop { name } }');

    // THEN
    expect(response.status).toEqual(200);
    expect(await response.json()).toEqual({shop: {name: 'Test shop'}});
  });

  it('returns a session object as part of the context', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const session = await setUpValidSession(shopify.sessionStorage, false);

    // WHEN
    const {session: actualSession} = await shopify.unauthenticated.admin(
      TEST_SHOP,
    );

    // THEN
    expect(actualSession).toEqual(session);
  });
});
