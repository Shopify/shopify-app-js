/***********************************************************************************************************************
* This file is auto-generated. If you have an issue, please create a GitHub issue.                                     *
***********************************************************************************************************************/

import {Session} from '../../../../lib/session/session';
import {queueMockResponse} from '../../../../lib/__tests__/test-helper';
import {testConfig} from '../../../../lib/__tests__/test-config';
import {ApiVersion} from '../../../../lib/types';
import {shopifyApi} from '../../../../lib';

import {restResources} from '../../2025-04';

describe('TenderTransaction resource', () => {
  const domain = 'test-shop.myshopify.io';
  const headers = {'X-Shopify-Access-Token': 'this_is_a_test_token'};
  const session = new Session({
    id: '1234',
    shop: domain,
    state: '1234',
    isOnline: true,
  });
  session.accessToken = 'this_is_a_test_token';

  it('test_1', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"tender_transactions": [{"id": 1011222837, "order_id": 450789469, "amount": "250.94", "currency": "USD", "user_id": null, "test": false, "processed_at": "2005-08-07T10:22:51-04:00", "remote_reference": "authorization-key", "payment_details": null, "payment_method": "credit_card"}, {"id": 1011222836, "order_id": 450789469, "amount": "250.94", "currency": "USD", "user_id": null, "test": false, "processed_at": "2005-08-05T10:22:51-04:00", "remote_reference": "authorization-key", "payment_details": null, "payment_method": "credit_card"}]}));

    await shopify.rest.TenderTransaction.all({
      session: session,
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-04/tender_transactions.json',
      query: '',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_2', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"tender_transactions": [{"id": 1011222835, "order_id": 450789469, "amount": "250.94", "currency": "USD", "user_id": null, "test": false, "processed_at": "2005-08-07T10:22:51-04:00", "remote_reference": "authorization-key", "payment_details": null, "payment_method": "credit_card"}]}));

    await shopify.rest.TenderTransaction.all({
      session: session,
      since_id: "1011222834",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-04/tender_transactions.json',
      query: 'since_id=1011222834',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_3', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"tender_transactions": [{"id": 1011222826, "order_id": 450789469, "amount": "250.94", "currency": "USD", "user_id": null, "test": false, "processed_at": "2005-08-05T10:22:51-04:00", "remote_reference": "authorization-key", "payment_details": null, "payment_method": "credit_card"}, {"id": 1011222827, "order_id": 450789469, "amount": "250.94", "currency": "USD", "user_id": null, "test": false, "processed_at": "2005-08-07T10:22:51-04:00", "remote_reference": "authorization-key", "payment_details": null, "payment_method": "credit_card"}]}));

    await shopify.rest.TenderTransaction.all({
      session: session,
      order: "processed_at ASC",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-04/tender_transactions.json',
      query: 'order=processed_at+ASC',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_4', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"tender_transactions": [{"id": 1011222831, "order_id": 450789469, "amount": "250.94", "currency": "USD", "user_id": null, "test": false, "processed_at": "2005-08-07T10:22:51-04:00", "remote_reference": "authorization-key", "payment_details": null, "payment_method": "credit_card"}]}));

    await shopify.rest.TenderTransaction.all({
      session: session,
      processed_at_min: "2005-08-06 10:22:51 -0400",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-04/tender_transactions.json',
      query: 'processed_at_min=2005-08-06+10%3A22%3A51+-0400',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_5', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"tender_transactions": [{"id": 1011222828, "order_id": 450789469, "amount": "250.94", "currency": "USD", "user_id": null, "test": false, "processed_at": "2005-08-05T10:22:51-04:00", "remote_reference": "authorization-key", "payment_details": null, "payment_method": "credit_card"}]}));

    await shopify.rest.TenderTransaction.all({
      session: session,
      processed_at_max: "2005-08-06 10:22:51 -0400",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-04/tender_transactions.json',
      query: 'processed_at_max=2005-08-06+10%3A22%3A51+-0400',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_6', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"tender_transactions": [{"id": 1011222832, "order_id": 450789469, "amount": "250.94", "currency": "USD", "user_id": null, "test": false, "processed_at": "2005-08-05T10:22:51-04:00", "remote_reference": "authorization-key", "payment_details": null, "payment_method": "credit_card"}]}));

    await shopify.rest.TenderTransaction.all({
      session: session,
      processed_at_max: "2005-08-05 10:22:51 -0400",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-04/tender_transactions.json',
      query: 'processed_at_max=2005-08-05+10%3A22%3A51+-0400',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

});
