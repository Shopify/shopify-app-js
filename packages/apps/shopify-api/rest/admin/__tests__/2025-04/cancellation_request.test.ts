/***********************************************************************************************************************
* This file is auto-generated. If you have an issue, please create a GitHub issue.                                     *
***********************************************************************************************************************/

import {Session} from '../../../../lib/session/session';
import {queueMockResponse} from '../../../../lib/__tests__/test-helper';
import {testConfig} from '../../../../lib/__tests__/test-config';
import {ApiVersion} from '../../../../lib/types';
import {shopifyApi} from '../../../../lib';

import {restResources} from '../../2025-04';

describe('CancellationRequest resource', () => {
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

    queueMockResponse(JSON.stringify({"fulfillment_order": {"id": 1046000803, "created_at": "2025-04-02T11:35:24-05:00", "updated_at": "2025-04-02T11:35:24-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "cancellation_requested", "status": "in_progress", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["create_fulfillment", "cancel_fulfillment_order"], "destination": {"id": 1042572135, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "origin": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "line_items": [{"id": 1072503299, "shop_id": 548380009, "fulfillment_order_id": 1046000803, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}], "outgoing_requests": [], "international_duties": null, "fulfillment_holds": [], "delivery_method": null}}));

    const cancellation_request = new shopify.rest.CancellationRequest({session: session});
    cancellation_request.fulfillment_order_id = 1046000803;
    cancellation_request.message = "The customer changed his mind.";
    await cancellation_request.save({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-04/fulfillment_orders/1046000803/cancellation_request.json',
      query: '',
      headers,
      data: { "cancellation_request": {"message": "The customer changed his mind."} }
    }).toMatchMadeHttpRequest();
  });

  it('test_2', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"fulfillment_order": {"id": 1046000804, "created_at": "2025-04-02T11:35:24-05:00", "updated_at": "2025-04-02T11:35:25-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "cancellation_accepted", "status": "cancelled", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["request_fulfillment", "create_fulfillment", "hold"], "destination": {"id": 1042572136, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "origin": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "line_items": [{"id": 1072503300, "shop_id": 548380009, "fulfillment_order_id": 1046000804, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}], "outgoing_requests": [], "international_duties": null, "fulfillment_holds": [], "delivery_method": null}}));

    const cancellation_request = new shopify.rest.CancellationRequest({session: session});
    cancellation_request.fulfillment_order_id = 1046000804;
    await cancellation_request.accept({
      body: {"cancellation_request": {"message": "We had not started any processing yet."}},
    });

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-04/fulfillment_orders/1046000804/cancellation_request/accept.json',
      query: '',
      headers,
      data: { "cancellation_request": {"message": "We had not started any processing yet."} }
    }).toMatchMadeHttpRequest();
  });

  it('test_3', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"fulfillment_order": {"id": 1046000802, "created_at": "2025-04-02T11:35:23-05:00", "updated_at": "2025-04-02T11:35:24-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "cancellation_rejected", "status": "in_progress", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["create_fulfillment"], "destination": {"id": 1042572134, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "origin": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "line_items": [{"id": 1072503298, "shop_id": 548380009, "fulfillment_order_id": 1046000802, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}], "outgoing_requests": [], "international_duties": null, "fulfillment_holds": [], "delivery_method": null}}));

    const cancellation_request = new shopify.rest.CancellationRequest({session: session});
    cancellation_request.fulfillment_order_id = 1046000802;
    await cancellation_request.reject({
      body: {"cancellation_request": {"message": "We have already sent the shipment out."}},
    });

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-04/fulfillment_orders/1046000802/cancellation_request/reject.json',
      query: '',
      headers,
      data: { "cancellation_request": {"message": "We have already sent the shipment out."} }
    }).toMatchMadeHttpRequest();
  });

});
