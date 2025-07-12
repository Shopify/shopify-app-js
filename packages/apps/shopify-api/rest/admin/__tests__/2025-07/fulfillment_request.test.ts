/***********************************************************************************************************************
* This file is auto-generated. If you have an issue, please create a GitHub issue.                                     *
***********************************************************************************************************************/

import {Session} from '../../../../lib/session/session';
import {queueMockResponse} from '../../../../lib/__tests__/test-helper';
import {testConfig} from '../../../../lib/__tests__/test-config';
import {ApiVersion} from '../../../../lib/types';
import {shopifyApi} from '../../../../lib';

import {restResources} from '../../2025-07';

describe('FulfillmentRequest resource', () => {
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
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"original_fulfillment_order": {"id": 1046000806, "created_at": "2025-04-02T11:35:26-05:00", "updated_at": "2025-04-02T11:35:27-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "submitted", "status": "open", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["cancel_fulfillment_order"], "destination": {"id": 1042572138, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "origin": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "line_items": [{"id": 1072503304, "shop_id": 548380009, "fulfillment_order_id": 1046000806, "quantity": 1, "line_item_id": 466157049, "inventory_item_id": 39072856, "fulfillable_quantity": 1, "variant_id": 39072856}, {"id": 1072503305, "shop_id": 548380009, "fulfillment_order_id": 1046000806, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}, {"id": 1072503306, "shop_id": 548380009, "fulfillment_order_id": 1046000806, "quantity": 1, "line_item_id": 703073504, "inventory_item_id": 457924702, "fulfillable_quantity": 1, "variant_id": 457924702}], "outgoing_requests": [{"message": "Fulfill this ASAP please.", "request_options": {"notify_customer": false}, "sent_at": "2025-04-02T11:35:27-05:00", "kind": "fulfillment_request"}], "international_duties": null, "fulfillment_holds": [], "delivery_method": {"id": 989232621, "method_type": "shipping", "min_delivery_date_time": null, "max_delivery_date_time": null, "additional_information": {"phone": null, "instructions": null, "failed_carriers": null, "pickup_point_id": null}, "service_code": null, "detailed_branded_promise": null, "source_reference": null, "presented_name": "Expedited Shipping"}}, "submitted_fulfillment_order": {"id": 1046000806, "created_at": "2025-04-02T11:35:26-05:00", "updated_at": "2025-04-02T11:35:27-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "submitted", "status": "open", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["cancel_fulfillment_order"], "destination": {"id": 1042572138, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "origin": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "line_items": [{"id": 1072503304, "shop_id": 548380009, "fulfillment_order_id": 1046000806, "quantity": 1, "line_item_id": 466157049, "inventory_item_id": 39072856, "fulfillable_quantity": 1, "variant_id": 39072856}, {"id": 1072503305, "shop_id": 548380009, "fulfillment_order_id": 1046000806, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}, {"id": 1072503306, "shop_id": 548380009, "fulfillment_order_id": 1046000806, "quantity": 1, "line_item_id": 703073504, "inventory_item_id": 457924702, "fulfillable_quantity": 1, "variant_id": 457924702}], "outgoing_requests": [{"message": "Fulfill this ASAP please.", "request_options": {"notify_customer": false}, "sent_at": "2025-04-02T11:35:27-05:00", "kind": "fulfillment_request"}], "international_duties": null, "fulfillment_holds": [], "delivery_method": {"id": 989232621, "method_type": "shipping", "min_delivery_date_time": null, "max_delivery_date_time": null, "additional_information": {"phone": null, "instructions": null, "failed_carriers": null, "pickup_point_id": null}, "service_code": null, "detailed_branded_promise": null, "source_reference": null, "presented_name": "Expedited Shipping"}}, "unsubmitted_fulfillment_order": null}));

    const fulfillment_request = new shopify.rest.FulfillmentRequest({session: session});
    fulfillment_request.fulfillment_order_id = 1046000806;
    fulfillment_request.message = "Fulfill this ASAP please.";
    await fulfillment_request.save({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-07/fulfillment_orders/1046000806/fulfillment_request.json',
      query: '',
      headers,
      data: { "fulfillment_request": {"message": "Fulfill this ASAP please."} }
    }).toMatchMadeHttpRequest();
  });

  it('test_2', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"original_fulfillment_order": {"id": 1046000807, "created_at": "2025-04-02T11:35:27-05:00", "updated_at": "2025-04-02T11:35:27-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "submitted", "status": "open", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["cancel_fulfillment_order"], "destination": {"id": 1042572139, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "origin": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "line_items": [{"id": 1072503307, "shop_id": 548380009, "fulfillment_order_id": 1046000807, "quantity": 1, "line_item_id": 466157049, "inventory_item_id": 39072856, "fulfillable_quantity": 1, "variant_id": 39072856}, {"id": 1072503308, "shop_id": 548380009, "fulfillment_order_id": 1046000807, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}], "outgoing_requests": [{"message": "Fulfill this ASAP please.", "request_options": {"notify_customer": true}, "sent_at": "2025-04-02T11:35:27-05:00", "kind": "fulfillment_request"}], "international_duties": null, "fulfillment_holds": [], "delivery_method": {"id": 989232622, "method_type": "shipping", "min_delivery_date_time": null, "max_delivery_date_time": null, "additional_information": {"phone": null, "instructions": null, "failed_carriers": null, "pickup_point_id": null}, "service_code": null, "detailed_branded_promise": null, "source_reference": null, "presented_name": "Expedited Shipping"}}, "submitted_fulfillment_order": {"id": 1046000807, "created_at": "2025-04-02T11:35:27-05:00", "updated_at": "2025-04-02T11:35:27-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "submitted", "status": "open", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["cancel_fulfillment_order"], "destination": {"id": 1042572139, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "origin": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "line_items": [{"id": 1072503307, "shop_id": 548380009, "fulfillment_order_id": 1046000807, "quantity": 1, "line_item_id": 466157049, "inventory_item_id": 39072856, "fulfillable_quantity": 1, "variant_id": 39072856}, {"id": 1072503308, "shop_id": 548380009, "fulfillment_order_id": 1046000807, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}], "outgoing_requests": [{"message": "Fulfill this ASAP please.", "request_options": {"notify_customer": true}, "sent_at": "2025-04-02T11:35:27-05:00", "kind": "fulfillment_request"}], "international_duties": null, "fulfillment_holds": [], "delivery_method": {"id": 989232622, "method_type": "shipping", "min_delivery_date_time": null, "max_delivery_date_time": null, "additional_information": {"phone": null, "instructions": null, "failed_carriers": null, "pickup_point_id": null}, "service_code": null, "detailed_branded_promise": null, "source_reference": null, "presented_name": "Expedited Shipping"}}, "unsubmitted_fulfillment_order": {"id": 1046000808, "created_at": "2025-04-02T11:35:27-05:00", "updated_at": "2025-04-02T11:35:27-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "unsubmitted", "status": "open", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["request_fulfillment", "create_fulfillment", "hold", "merge"], "destination": {"id": 1042572140, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "origin": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "line_items": [{"id": 1072503309, "shop_id": 548380009, "fulfillment_order_id": 1046000808, "quantity": 1, "line_item_id": 703073504, "inventory_item_id": 457924702, "fulfillable_quantity": 1, "variant_id": 457924702}], "outgoing_requests": [], "international_duties": null, "fulfillment_holds": [], "delivery_method": {"id": 989232623, "method_type": "shipping", "min_delivery_date_time": null, "max_delivery_date_time": null, "additional_information": {"phone": null, "instructions": null, "failed_carriers": null, "pickup_point_id": null}, "service_code": null, "detailed_branded_promise": null, "source_reference": null, "presented_name": "Expedited Shipping"}}}));

    const fulfillment_request = new shopify.rest.FulfillmentRequest({session: session});
    fulfillment_request.fulfillment_order_id = 1046000807;
    fulfillment_request.message = "Fulfill this ASAP please.";
    fulfillment_request.fulfillment_order_line_items = [
      {
        "id": 1072503307,
        "quantity": 1
      },
      {
        "id": 1072503308,
        "quantity": 1
      }
    ];
    fulfillment_request.notify_customer = true;
    await fulfillment_request.save({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-07/fulfillment_orders/1046000807/fulfillment_request.json',
      query: '',
      headers,
      data: { "fulfillment_request": {"message": "Fulfill this ASAP please.", "fulfillment_order_line_items": [{"id": 1072503307, "quantity": 1}, {"id": 1072503308, "quantity": 1}], "notify_customer": true} }
    }).toMatchMadeHttpRequest();
  });

  it('test_3', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"fulfillment_order": {"id": 1046000809, "created_at": "2025-04-02T11:35:28-05:00", "updated_at": "2025-04-02T11:35:28-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "accepted", "status": "in_progress", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["create_fulfillment", "request_cancellation"], "destination": {"id": 1042572141, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "origin": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "line_items": [{"id": 1072503310, "shop_id": 548380009, "fulfillment_order_id": 1046000809, "quantity": 1, "line_item_id": 466157049, "inventory_item_id": 39072856, "fulfillable_quantity": 1, "variant_id": 39072856}, {"id": 1072503311, "shop_id": 548380009, "fulfillment_order_id": 1046000809, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}, {"id": 1072503312, "shop_id": 548380009, "fulfillment_order_id": 1046000809, "quantity": 1, "line_item_id": 703073504, "inventory_item_id": 457924702, "fulfillable_quantity": 1, "variant_id": 457924702}], "outgoing_requests": [], "international_duties": null, "fulfillment_holds": [], "delivery_method": {"id": 989232624, "method_type": "shipping", "min_delivery_date_time": null, "max_delivery_date_time": null, "additional_information": {"phone": null, "instructions": null, "failed_carriers": null, "pickup_point_id": null}, "service_code": null, "detailed_branded_promise": null, "source_reference": null, "presented_name": "Expedited Shipping"}}}));

    const fulfillment_request = new shopify.rest.FulfillmentRequest({session: session});
    fulfillment_request.fulfillment_order_id = 1046000809;
    await fulfillment_request.accept({
      body: {"fulfillment_request": {"message": "We will start processing your fulfillment on the next business day."}},
    });

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-07/fulfillment_orders/1046000809/fulfillment_request/accept.json',
      query: '',
      headers,
      data: { "fulfillment_request": {"message": "We will start processing your fulfillment on the next business day."} }
    }).toMatchMadeHttpRequest();
  });

  it('test_4', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"fulfillment_order": {"id": 1046000805, "created_at": "2025-04-02T11:35:25-05:00", "updated_at": "2025-04-02T11:35:26-05:00", "shop_id": 548380009, "order_id": 450789469, "assigned_location_id": 24826418, "request_status": "rejected", "status": "open", "fulfill_at": null, "fulfill_by": null, "supported_actions": ["request_fulfillment", "create_fulfillment", "hold", "split"], "destination": {"id": 1042572137, "address1": "Chestnut Street 92", "address2": "", "city": "Louisville", "company": null, "country": "United States", "email": "bob.norman@mail.example.com", "first_name": "Bob", "last_name": "Norman", "phone": "+1(502)-459-2181", "province": "Kentucky", "zip": "40202"}, "origin": {"address1": null, "address2": null, "city": null, "country_code": "DE", "location_id": 24826418, "name": "Apple Api Shipwire", "phone": null, "province": null, "zip": null}, "line_items": [{"id": 1072503301, "shop_id": 548380009, "fulfillment_order_id": 1046000805, "quantity": 1, "line_item_id": 466157049, "inventory_item_id": 39072856, "fulfillable_quantity": 1, "variant_id": 39072856}, {"id": 1072503302, "shop_id": 548380009, "fulfillment_order_id": 1046000805, "quantity": 1, "line_item_id": 518995019, "inventory_item_id": 49148385, "fulfillable_quantity": 1, "variant_id": 49148385}, {"id": 1072503303, "shop_id": 548380009, "fulfillment_order_id": 1046000805, "quantity": 1, "line_item_id": 703073504, "inventory_item_id": 457924702, "fulfillable_quantity": 1, "variant_id": 457924702}], "outgoing_requests": [], "international_duties": null, "fulfillment_holds": [], "delivery_method": {"id": 989232620, "method_type": "shipping", "min_delivery_date_time": null, "max_delivery_date_time": null, "additional_information": {"phone": null, "instructions": null, "failed_carriers": null, "pickup_point_id": null}, "service_code": null, "detailed_branded_promise": null, "source_reference": null, "presented_name": "Expedited Shipping"}}}));

    const fulfillment_request = new shopify.rest.FulfillmentRequest({session: session});
    fulfillment_request.fulfillment_order_id = 1046000805;
    await fulfillment_request.reject({
      body: {"fulfillment_request": {"message": "Not enough inventory on hand to complete the work.", "reason": "inventory_out_of_stock", "line_items": [{"fulfillment_order_line_item_id": 1072503301, "message": "Not enough inventory."}]}},
    });

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-07/fulfillment_orders/1046000805/fulfillment_request/reject.json',
      query: '',
      headers,
      data: { "fulfillment_request": {"message": "Not enough inventory on hand to complete the work.", "reason": "inventory_out_of_stock", "line_items": [{"fulfillment_order_line_item_id": 1072503301, "message": "Not enough inventory."}]} }
    }).toMatchMadeHttpRequest();
  });

});
