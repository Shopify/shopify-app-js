/***********************************************************************************************************************
* This file is auto-generated. If you have an issue, please create a GitHub issue.                                     *
***********************************************************************************************************************/

import {Session} from '../../../../lib/session/session';
import {queueMockResponse} from '../../../../lib/__tests__/test-helper';
import {testConfig} from '../../../../lib/__tests__/test-config';
import {ApiVersion} from '../../../../lib/types';
import {shopifyApi} from '../../../../lib';

import {restResources} from '../../2025-01';

describe('FulfillmentOrder resource', () => {
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
      testConfig({apiVersion: ApiVersion.January25, restResources}),
    );

    queueMockResponse(JSON.stringify({"fulfillment_orders": [{"id": 1046000780, "created_at": "2025-01-02T11:22:25-05:00", "updated_at": "2025-01-02T11:22:25-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "submitted", "status": "open", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["cancel_fulfillment_order"], "destination": {"id": 1042572112, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "line_items": [{"id": 1072503277, "shop_id": 548380009, "fulfillment_order_id": 1046000780, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}], "international_duties": null, "fulfillment_holds": [], "delivery_method": null, "assigned_location": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "merchant_requests": []}]}));

    await shopify.rest.FulfillmentOrder.all({
      session: session,
      order_id: 450789469,
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-01/orders/450789469/fulfillment_orders.json',
      query: '',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_2', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.January25, restResources}),
    );

    queueMockResponse(JSON.stringify({"fulfillment_orders": [{"id": 1046000784, "created_at": "2025-01-02T11:22:28-05:00", "updated_at": "2025-01-02T11:22:28-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "submitted", "status": "open", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["cancel_fulfillment_order"], "destination": {"id": 1042572116, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "line_items": [{"id": 1072503281, "shop_id": 548380009, "fulfillment_order_id": 1046000784, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385, "financial_summaries": [{"quantity": 1, "original_unit_price_set": "199.00", "approximate_discounted_unit_price_set": "199.00", "discount_allocations": [{"amount": "3.33", "discount_application": {"allocation_method": "across", "target_selection": "all", "target_type": "line_item"}}]}]}], "international_duties": null, "fulfillment_holds": [], "delivery_method": null, "assigned_location": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "merchant_requests": []}]}));

    await shopify.rest.FulfillmentOrder.all({
      session: session,
      order_id: 450789469,
      include_financial_summaries: "true",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-01/orders/450789469/fulfillment_orders.json',
      query: 'include_financial_summaries=true',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_3', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.January25, restResources}),
    );

    queueMockResponse(JSON.stringify({"fulfillment_orders": [{"id": 1046000783, "created_at": "2025-01-02T11:22:28-05:00", "updated_at": "2025-01-02T11:22:28-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "submitted", "status": "open", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["cancel_fulfillment_order"], "destination": {"id": 1042572115, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "line_items": [{"id": 1072503280, "shop_id": 548380009, "fulfillment_order_id": 1046000783, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}], "international_duties": null, "fulfillment_holds": [], "order_name": "#1001", "order_processed_at": "2008-01-10T11:00:00-05:00", "channel_id": null, "delivery_method": null, "assigned_location": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "merchant_requests": []}]}));

    await shopify.rest.FulfillmentOrder.all({
      session: session,
      order_id: 450789469,
      include_order_reference_fields: "true",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-01/orders/450789469/fulfillment_orders.json',
      query: 'include_order_reference_fields=true',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_4', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.January25, restResources}),
    );

    queueMockResponse(JSON.stringify({"fulfillment_order": {"id": 1046000781, "created_at": "2025-01-02T11:22:26-05:00", "updated_at": "2025-01-02T11:22:26-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "submitted", "status": "open", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["cancel_fulfillment_order"], "destination": {"id": 1042572113, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "line_items": [{"id": 1072503278, "shop_id": 548380009, "fulfillment_order_id": 1046000781, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}], "international_duties": null, "fulfillment_holds": [], "delivery_method": null, "assigned_location": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "merchant_requests": []}}));

    await shopify.rest.FulfillmentOrder.find({
      session: session,
      id: 1046000781,
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-01/fulfillment_orders/1046000781.json',
      query: '',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_5', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.January25, restResources}),
    );

    queueMockResponse(JSON.stringify({"fulfillment_order": {"id": 1046000779, "created_at": "2025-01-02T11:22:24-05:00", "updated_at": "2025-01-02T11:22:25-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "submitted", "status": "open", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["cancel_fulfillment_order"], "destination": {"id": 1042572111, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "line_items": [{"id": 1072503276, "shop_id": 548380009, "fulfillment_order_id": 1046000779, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385, "financial_summaries": [{"quantity": 1, "original_unit_price_set": "199.00", "approximate_discounted_unit_price_set": "199.00", "discount_allocations": [{"amount": "3.33", "discount_application": {"allocation_method": "across", "target_selection": "all", "target_type": "line_item"}}]}]}], "international_duties": null, "fulfillment_holds": [], "delivery_method": null, "assigned_location": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "merchant_requests": []}}));

    await shopify.rest.FulfillmentOrder.find({
      session: session,
      id: 1046000779,
      include_financial_summaries: "true",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-01/fulfillment_orders/1046000779.json',
      query: 'include_financial_summaries=true',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_6', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.January25, restResources}),
    );

    queueMockResponse(JSON.stringify({"fulfillment_order": {"id": 1046000790, "created_at": "2025-01-02T11:22:33-05:00", "updated_at": "2025-01-02T11:22:33-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "submitted", "status": "open", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["cancel_fulfillment_order"], "destination": {"id": 1042572122, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "line_items": [{"id": 1072503286, "shop_id": 548380009, "fulfillment_order_id": 1046000790, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}], "international_duties": null, "fulfillment_holds": [], "order_name": "#1001", "order_processed_at": "2008-01-10T11:00:00-05:00", "channel_id": null, "delivery_method": null, "assigned_location": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "merchant_requests": []}}));

    await shopify.rest.FulfillmentOrder.find({
      session: session,
      id: 1046000790,
      include_order_reference_fields: "true",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-01/fulfillment_orders/1046000790.json',
      query: 'include_order_reference_fields=true',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_7', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.January25, restResources}),
    );

    queueMockResponse(JSON.stringify({"fulfillment_order": {"id": 1046000788, "created_at": "2025-01-02T11:22:32-05:00", "updated_at": "2025-01-02T11:22:32-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "submitted", "status": "closed", "fulfill_at": null, "fulfill_by": null, "supported_actions": [], "destination": {"id": 1042572120, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "line_items": [], "international_duties": null, "fulfillment_holds": [], "delivery_method": null, "assigned_location": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "merchant_requests": []}, "replacement_fulfillment_order": {"id": 1046000789, "created_at": "2025-01-02T11:22:32-05:00", "updated_at": "2025-01-02T11:22:32-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "unsubmitted", "status": "open", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["request_fulfillment", "create_fulfillment", "hold"], "destination": {"id": 1042572121, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "line_items": [{"id": 1072503285, "shop_id": 548380009, "fulfillment_order_id": 1046000789, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}], "international_duties": null, "fulfillment_holds": [], "delivery_method": null, "assigned_location": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "merchant_requests": []}}));

    const fulfillment_order = new shopify.rest.FulfillmentOrder({session: session});
    fulfillment_order.id = 1046000788;
    await fulfillment_order.cancel({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-01/fulfillment_orders/1046000788/cancel.json',
      query: '',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_8', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.January25, restResources}),
    );

    queueMockResponse(JSON.stringify({"fulfillment_order": {"id": 1046000793, "created_at": "2025-01-02T11:22:35-05:00", "updated_at": "2025-01-02T11:22:36-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "closed", "status": "incomplete", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["request_fulfillment", "create_fulfillment", "hold"], "destination": {"id": 1042572125, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "line_items": [{"id": 1072503289, "shop_id": 548380009, "fulfillment_order_id": 1046000793, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}], "international_duties": null, "fulfillment_holds": [], "delivery_method": null, "assigned_location": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "merchant_requests": []}}));

    const fulfillment_order = new shopify.rest.FulfillmentOrder({session: session});
    fulfillment_order.id = 1046000793;
    await fulfillment_order.close({
      body: {"fulfillment_order": {"message": "Not enough inventory to complete this work."}},
    });

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-01/fulfillment_orders/1046000793/close.json',
      query: '',
      headers,
      data: { "fulfillment_order": {"message": "Not enough inventory to complete this work."} }
    }).toMatchMadeHttpRequest();
  });

  it('test_9', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.January25, restResources}),
    );

    queueMockResponse(JSON.stringify({"original_fulfillment_order": {"id": 1046000786, "created_at": "2025-01-02T11:22:30-05:00", "updated_at": "2025-01-02T11:22:31-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 487838322, "request_status": "submitted", "status": "closed", "fulfill_at": null, "fulfill_by": null, "supported_actions": [], "destination": {"id": 1042572118, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "line_items": [], "international_duties": null, "fulfillment_holds": [], "delivery_method": null, "assigned_location": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "merchant_requests": []}, "moved_fulfillment_order": {"id": 1046000787, "created_at": "2025-01-02T11:22:31-05:00", "updated_at": "2025-01-02T11:22:31-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 655441491, "request_status": "unsubmitted", "status": "open", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["create_fulfillment", "move", "hold"], "destination": {"id": 1042572119, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "line_items": [{"id": 1072503284, "shop_id": 548380009, "fulfillment_order_id": 1046000787, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}], "international_duties": null, "fulfillment_holds": [], "delivery_method": null, "assigned_location": {"address1": "50 Rideau Street", "address2": null, "city": "Ottawa", "country_code": "CA", "location_id": 655441491, "name": "50 Rideau Street", "phone": null, "province": "Ontario", "zip": "K1N 9J7"}, "merchant_requests": []}, "remaining_fulfillment_order": null}));

    const fulfillment_order = new shopify.rest.FulfillmentOrder({session: session});
    fulfillment_order.id = 1046000786;
    await fulfillment_order.move({
      body: {"fulfillment_order": {"new_location_id": 655441491, "fulfillment_order_line_items": [{"id": 1072503283, "quantity": 1}]}},
    });

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-01/fulfillment_orders/1046000786/move.json',
      query: '',
      headers,
      data: { "fulfillment_order": {"new_location_id": 655441491, "fulfillment_order_line_items": [{"id": 1072503283, "quantity": 1}]} }
    }).toMatchMadeHttpRequest();
  });

  it('test_10', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.January25, restResources}),
    );

    queueMockResponse(JSON.stringify({"fulfillment_order": {"id": 1046000785, "created_at": "2025-01-02T11:22:29-05:00", "updated_at": "2025-01-02T11:22:30-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "unsubmitted", "status": "open", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["request_fulfillment", "create_fulfillment", "hold"], "destination": {"id": 1042572117, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "line_items": [{"id": 1072503282, "shop_id": 548380009, "fulfillment_order_id": 1046000785, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}], "international_duties": null, "fulfillment_holds": [], "delivery_method": null, "assigned_location": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "merchant_requests": []}}));

    const fulfillment_order = new shopify.rest.FulfillmentOrder({session: session});
    fulfillment_order.id = 1046000785;
    await fulfillment_order.open({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-01/fulfillment_orders/1046000785/open.json',
      query: '',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_11', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.January25, restResources}),
    );

    queueMockResponse(JSON.stringify({"fulfillment_order": {"id": 1046000791, "created_at": "2025-01-02T11:22:33-05:00", "updated_at": "2025-01-02T11:22:34-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "unsubmitted", "status": "scheduled", "fulfill_at": "2026-02-02T11:22:00-05:00", "fulfill_by": null, "supported_actions": ["mark_as_open"], "destination": {"id": 1042572123, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "line_items": [{"id": 1072503287, "shop_id": 548380009, "fulfillment_order_id": 1046000791, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}], "international_duties": null, "fulfillment_holds": [], "delivery_method": null, "assigned_location": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "merchant_requests": []}}));

    const fulfillment_order = new shopify.rest.FulfillmentOrder({session: session});
    fulfillment_order.id = 1046000791;
    await fulfillment_order.reschedule({
      body: {"fulfillment_order": {"new_fulfill_at": "2026-02-02 16:22 UTC"}},
    });

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-01/fulfillment_orders/1046000791/reschedule.json',
      query: '',
      headers,
      data: { "fulfillment_order": {"new_fulfill_at": "2026-02-02 16:22 UTC"} }
    }).toMatchMadeHttpRequest();
  });

  it('test_12', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.January25, restResources}),
    );

    queueMockResponse(JSON.stringify({"fulfillment_order": {"id": 1046000782, "created_at": "2025-01-02T11:22:26-05:00", "updated_at": "2025-01-02T11:22:27-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "unsubmitted", "status": "on_hold", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["release_hold", "hold"], "destination": {"id": 1042572114, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "line_items": [{"id": 1072503279, "shop_id": 548380009, "fulfillment_order_id": 1046000782, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}], "international_duties": null, "fulfillment_holds": [{"reason": "inventory_out_of_stock", "reason_notes": "Not enough inventory to complete this work."}], "delivery_method": null, "assigned_location": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "merchant_requests": []}}));

    const fulfillment_order = new shopify.rest.FulfillmentOrder({session: session});
    fulfillment_order.id = 1046000782;
    await fulfillment_order.hold({
      body: {"fulfillment_hold": {"reason": "inventory_out_of_stock", "reason_notes": "Not enough inventory to complete this work.", "fulfillment_order_line_items": [{"id": 1072503279, "quantity": 1}]}},
    });

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-01/fulfillment_orders/1046000782/hold.json',
      query: '',
      headers,
      data: {"fulfillment_hold": {"reason": "inventory_out_of_stock", "reason_notes": "Not enough inventory to complete this work.", "fulfillment_order_line_items": [{"id": 1072503279, "quantity": 1}]}}
    }).toMatchMadeHttpRequest();
  });

  it('test_13', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.January25, restResources}),
    );

    queueMockResponse(JSON.stringify({}));

    const fulfillment_order = new shopify.rest.FulfillmentOrder({session: session});

    await fulfillment_order.set_fulfillment_orders_deadline({
      body: {"fulfillment_order_ids": [1046000792], "fulfillment_deadline": "2021-05-26T10:00:00-04:00"},
    });

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-01/fulfillment_orders/set_fulfillment_orders_deadline.json',
      query: '',
      headers,
      data: {"fulfillment_order_ids": [1046000792], "fulfillment_deadline": "2021-05-26T10:00:00-04:00"}
    }).toMatchMadeHttpRequest();
  });

  it('test_14', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.January25, restResources}),
    );

    queueMockResponse(JSON.stringify({"fulfillment_order": {"id": 1046000794, "created_at": "2025-01-02T11:22:36-05:00", "updated_at": "2025-01-02T11:22:37-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "submitted", "status": "open", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["cancel_fulfillment_order"], "destination": {"id": 1042572126, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "origin": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "line_items": [{"id": 1072503290, "shop_id": 548380009, "fulfillment_order_id": 1046000794, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}], "outgoing_requests": [], "international_duties": null, "fulfillment_holds": [], "delivery_method": null}}));

    const fulfillment_order = new shopify.rest.FulfillmentOrder({session: session});
    fulfillment_order.id = 1046000794;
    await fulfillment_order.release_hold({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-01/fulfillment_orders/1046000794/release_hold.json',
      query: '',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

});
