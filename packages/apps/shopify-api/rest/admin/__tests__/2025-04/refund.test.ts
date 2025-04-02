/***********************************************************************************************************************
* This file is auto-generated. If you have an issue, please create a GitHub issue.                                     *
***********************************************************************************************************************/

import {Session} from '../../../../lib/session/session';
import {queueMockResponse} from '../../../../lib/__tests__/test-helper';
import {testConfig} from '../../../../lib/__tests__/test-config';
import {ApiVersion} from '../../../../lib/types';
import {shopifyApi} from '../../../../lib';

import {restResources} from '../../2025-04';

describe('Refund resource', () => {
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

    queueMockResponse(JSON.stringify({"refunds": [{"id": 509562969, "order_id": 450789469, "created_at": "2025-04-02T11:38:15-05:00", "note": "it broke during shipping", "user_id": 548380009, "processed_at": "2025-04-02T11:38:15-05:00", "duties": [], "total_duties_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "return": null, "restock": true, "additional_fees": [], "total_additional_fees_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "refund_shipping_lines": [], "admin_graphql_api_id": "gid://shopify/Refund/509562969", "order_adjustments": [], "refund_line_items": [{"id": 104689539, "quantity": 1, "line_item_id": 703073504, "location_id": 487838322, "restock_type": "legacy_restock", "subtotal": 195.66, "total_tax": 3.98, "subtotal_set": {"shop_money": {"amount": "195.66", "currency_code": "USD"}, "presentment_money": {"amount": "195.66", "currency_code": "USD"}}, "total_tax_set": {"shop_money": {"amount": "3.98", "currency_code": "USD"}, "presentment_money": {"amount": "3.98", "currency_code": "USD"}}, "line_item": {"id": 703073504, "variant_id": 457924702, "title": "IPod Nano - 8gb", "quantity": 1, "sku": "IPOD2008BLACK", "variant_title": "black", "vendor": null, "fulfillment_service": "manual", "product_id": 632910392, "requires_shipping": true, "taxable": true, "gift_card": false, "name": "IPod Nano - 8gb - black", "variant_inventory_management": "shopify", "properties": [], "product_exists": true, "fulfillable_quantity": 1, "grams": 200, "price": "199.00", "total_discount": "0.00", "fulfillment_status": null, "price_set": {"shop_money": {"amount": "199.00", "currency_code": "USD"}, "presentment_money": {"amount": "199.00", "currency_code": "USD"}}, "total_discount_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "discount_allocations": [{"amount": "3.33", "discount_application_index": 0, "amount_set": {"shop_money": {"amount": "3.33", "currency_code": "USD"}, "presentment_money": {"amount": "3.33", "currency_code": "USD"}}}], "duties": [], "admin_graphql_api_id": "gid://shopify/LineItem/703073504", "tax_lines": [{"title": "State Tax", "price": "3.98", "rate": 0.06, "channel_liable": null, "price_set": {"shop_money": {"amount": "3.98", "currency_code": "USD"}, "presentment_money": {"amount": "3.98", "currency_code": "USD"}}}]}}, {"id": 709875399, "quantity": 1, "line_item_id": 466157049, "location_id": 487838322, "restock_type": "legacy_restock", "subtotal": 195.67, "total_tax": 3.98, "subtotal_set": {"shop_money": {"amount": "195.67", "currency_code": "USD"}, "presentment_money": {"amount": "195.67", "currency_code": "USD"}}, "total_tax_set": {"shop_money": {"amount": "3.98", "currency_code": "USD"}, "presentment_money": {"amount": "3.98", "currency_code": "USD"}}, "line_item": {"id": 466157049, "variant_id": 39072856, "title": "IPod Nano - 8gb", "quantity": 1, "sku": "IPOD2008GREEN", "variant_title": "green", "vendor": null, "fulfillment_service": "manual", "product_id": 632910392, "requires_shipping": true, "taxable": true, "gift_card": false, "name": "IPod Nano - 8gb - green", "variant_inventory_management": "shopify", "properties": [{"name": "Custom Engraving Front", "value": "Happy Birthday"}, {"name": "Custom Engraving Back", "value": "Merry Christmas"}], "product_exists": true, "fulfillable_quantity": 1, "grams": 200, "price": "199.00", "total_discount": "0.00", "fulfillment_status": null, "price_set": {"shop_money": {"amount": "199.00", "currency_code": "USD"}, "presentment_money": {"amount": "199.00", "currency_code": "USD"}}, "total_discount_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "discount_allocations": [{"amount": "3.34", "discount_application_index": 0, "amount_set": {"shop_money": {"amount": "3.34", "currency_code": "USD"}, "presentment_money": {"amount": "3.34", "currency_code": "USD"}}}], "duties": [], "admin_graphql_api_id": "gid://shopify/LineItem/466157049", "tax_lines": [{"title": "State Tax", "price": "3.98", "rate": 0.06, "channel_liable": null, "price_set": {"shop_money": {"amount": "3.98", "currency_code": "USD"}, "presentment_money": {"amount": "3.98", "currency_code": "USD"}}}]}}], "transactions": [{"id": 179259969, "order_id": 450789469, "kind": "refund", "gateway": "bogus", "status": "success", "message": null, "created_at": "2005-08-05T12:59:12-04:00", "test": false, "authorization": "authorization-key", "location_id": null, "user_id": null, "parent_id": 801038806, "processed_at": "2005-08-05T12:59:12-04:00", "device_id": null, "error_code": null, "source_name": "web", "receipt": {}, "amount": "209.00", "currency": "USD", "payment_id": "#1001.3", "total_unsettled_set": {"presentment_money": {"amount": "348.0", "currency": "USD"}, "shop_money": {"amount": "348.0", "currency": "USD"}}, "manual_payment_gateway": false, "amount_rounding": null, "admin_graphql_api_id": "gid://shopify/OrderTransaction/179259969"}]}]}));

    await shopify.rest.Refund.all({
      session: session,
      order_id: 450789469,
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-04/orders/450789469/refunds.json',
      query: '',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_2', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"refund": {"id": 929361472, "order_id": 450789469, "created_at": "2025-04-02T11:38:34-05:00", "note": "wrong size", "user_id": null, "processed_at": "2025-04-02T11:38:34-05:00", "duties": [], "total_duties_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "return": null, "restock": false, "additional_fees": [], "total_additional_fees_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "refund_shipping_lines": [], "admin_graphql_api_id": "gid://shopify/Refund/929361472", "order_adjustments": [], "refund_line_items": [{"location_id": null, "restock_type": "no_restock", "quantity": 1, "id": 1058498320, "line_item_id": 518995019, "subtotal": 0.0, "total_tax": 0.0, "subtotal_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "total_tax_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "line_item": {"id": 518995019, "variant_id": 49148385, "title": "IPod Nano - 8gb", "quantity": 1, "sku": "IPOD2008RED", "variant_title": "red", "vendor": null, "fulfillment_service": "manual", "product_id": 632910392, "requires_shipping": true, "taxable": true, "gift_card": false, "name": "IPod Nano - 8gb - red", "variant_inventory_management": "shopify", "properties": [], "product_exists": true, "fulfillable_quantity": 1, "grams": 200, "price": "199.00", "total_discount": "0.00", "fulfillment_status": null, "price_set": {"shop_money": {"amount": "199.00", "currency_code": "USD"}, "presentment_money": {"amount": "199.00", "currency_code": "USD"}}, "total_discount_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "discount_allocations": [{"amount": "3.33", "discount_application_index": 0, "amount_set": {"shop_money": {"amount": "3.33", "currency_code": "USD"}, "presentment_money": {"amount": "3.33", "currency_code": "USD"}}}], "duties": [], "admin_graphql_api_id": "gid://shopify/LineItem/518995019", "tax_lines": [{"title": "State Tax", "price": "3.98", "rate": 0.06, "channel_liable": null, "price_set": {"shop_money": {"amount": "3.98", "currency_code": "USD"}, "presentment_money": {"amount": "3.98", "currency_code": "USD"}}}]}}], "transactions": [{"id": 1068278526, "order_id": 450789469, "kind": "refund", "gateway": "bogus", "status": "success", "message": "Bogus Gateway: Forced success", "created_at": "2025-04-02T11:38:34-05:00", "test": true, "authorization": null, "location_id": null, "user_id": null, "parent_id": 801038806, "processed_at": "2025-04-02T11:38:34-05:00", "device_id": null, "error_code": null, "source_name": "755357713", "receipt": {}, "amount": "41.94", "currency": "USD", "payment_id": "c901414060.1", "total_unsettled_set": {"presentment_money": {"amount": "348.0", "currency": "USD"}, "shop_money": {"amount": "348.0", "currency": "USD"}}, "manual_payment_gateway": false, "amount_rounding": null, "admin_graphql_api_id": "gid://shopify/OrderTransaction/1068278526"}]}}));

    const refund = new shopify.rest.Refund({session: session});
    refund.order_id = 450789469;
    refund.currency = "USD";
    refund.notify = true;
    refund.note = "wrong size";
    refund.shipping = {
      "full_refund": true
    };
    refund.refund_line_items = [
      {
        "line_item_id": 518995019,
        "quantity": 1,
        "restock_type": "return",
        "location_id": 487838322
      }
    ];
    refund.transactions = [
      {
        "parent_id": 801038806,
        "amount": 41.94,
        "kind": "refund",
        "gateway": "bogus"
      }
    ];
    await refund.save({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-04/orders/450789469/refunds.json',
      query: '',
      headers,
      data: { "refund": {"currency": "USD", "notify": true, "note": "wrong size", "shipping": {"full_refund": true}, "refund_line_items": [{"line_item_id": 518995019, "quantity": 1, "restock_type": "return", "location_id": 487838322}], "transactions": [{"parent_id": 801038806, "amount": 41.94, "kind": "refund", "gateway": "bogus"}]} }
    }).toMatchMadeHttpRequest();
  });

  it('test_3', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"refund": {"id": 929361471, "order_id": 450789469, "created_at": "2025-04-02T11:38:32-05:00", "note": null, "user_id": null, "processed_at": "2025-04-02T11:38:32-05:00", "duties": [], "total_duties_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "return": null, "restock": false, "additional_fees": [], "total_additional_fees_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "refund_shipping_lines": [{"id": 623176826, "shipping_line_id": 369256396, "subtotal_amount_set": {"shop_money": {"amount": "5.00", "currency_code": "USD"}, "presentment_money": {"amount": "5.00", "currency_code": "USD"}}, "shipping_line": {"id": 369256396, "carrier_identifier": null, "code": "Free Shipping", "discounted_price": "5.00", "discounted_price_set": {"shop_money": {"amount": "5.00", "currency_code": "USD"}, "presentment_money": {"amount": "5.00", "currency_code": "USD"}}, "phone": null, "price": "5.00", "price_set": {"shop_money": {"amount": "5.00", "currency_code": "USD"}, "presentment_money": {"amount": "5.00", "currency_code": "USD"}}, "requested_fulfillment_service_id": null, "source": "shopify", "title": "Free Shipping", "tax_lines": [], "discount_allocations": []}}], "admin_graphql_api_id": "gid://shopify/Refund/929361471", "order_adjustments": [{"id": 1030976844, "order_id": 450789469, "refund_id": 929361471, "amount": "-5.00", "tax_amount": "0.00", "kind": "shipping_refund", "reason": "Shipping refund", "amount_set": {"shop_money": {"amount": "-5.00", "currency_code": "USD"}, "presentment_money": {"amount": "-5.00", "currency_code": "USD"}}, "tax_amount_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}}], "refund_line_items": [], "transactions": [{"id": 1068278525, "order_id": 450789469, "kind": "refund", "gateway": "bogus", "status": "success", "message": "Bogus Gateway: Forced success", "created_at": "2025-04-02T11:38:32-05:00", "test": true, "authorization": null, "location_id": null, "user_id": null, "parent_id": 801038806, "processed_at": "2025-04-02T11:38:32-05:00", "device_id": null, "error_code": null, "source_name": "755357713", "receipt": {}, "amount": "5.00", "currency": "USD", "payment_id": "c901414060.1", "total_unsettled_set": {"presentment_money": {"amount": "348.0", "currency": "USD"}, "shop_money": {"amount": "348.0", "currency": "USD"}}, "manual_payment_gateway": false, "amount_rounding": null, "admin_graphql_api_id": "gid://shopify/OrderTransaction/1068278525"}]}}));

    const refund = new shopify.rest.Refund({session: session});
    refund.order_id = 450789469;
    refund.currency = "USD";
    refund.shipping = {
      "amount": 5.0
    };
    refund.transactions = [
      {
        "parent_id": 801038806,
        "amount": 5.0,
        "kind": "refund",
        "gateway": "web"
      }
    ];
    await refund.save({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-04/orders/450789469/refunds.json',
      query: '',
      headers,
      data: { "refund": {"currency": "USD", "shipping": {"amount": 5.0}, "transactions": [{"parent_id": 801038806, "amount": 5.0, "kind": "refund", "gateway": "web"}]} }
    }).toMatchMadeHttpRequest();
  });

  it('test_4', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"refund": {"id": 509562969, "order_id": 450789469, "created_at": "2025-04-02T11:38:15-05:00", "note": "it broke during shipping", "user_id": 548380009, "processed_at": "2025-04-02T11:38:15-05:00", "duties": [], "total_duties_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "return": null, "restock": true, "additional_fees": [], "total_additional_fees_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "refund_shipping_lines": [], "admin_graphql_api_id": "gid://shopify/Refund/509562969", "order_adjustments": [], "refund_line_items": [{"id": 104689539, "quantity": 1, "line_item_id": 703073504, "location_id": 487838322, "restock_type": "legacy_restock", "subtotal": 195.66, "total_tax": 3.98, "subtotal_set": {"shop_money": {"amount": "195.66", "currency_code": "USD"}, "presentment_money": {"amount": "195.66", "currency_code": "USD"}}, "total_tax_set": {"shop_money": {"amount": "3.98", "currency_code": "USD"}, "presentment_money": {"amount": "3.98", "currency_code": "USD"}}, "line_item": {"id": 703073504, "variant_id": 457924702, "title": "IPod Nano - 8gb", "quantity": 1, "sku": "IPOD2008BLACK", "variant_title": "black", "vendor": null, "fulfillment_service": "manual", "product_id": 632910392, "requires_shipping": true, "taxable": true, "gift_card": false, "name": "IPod Nano - 8gb - black", "variant_inventory_management": "shopify", "properties": [], "product_exists": true, "fulfillable_quantity": 1, "grams": 200, "price": "199.00", "total_discount": "0.00", "fulfillment_status": null, "price_set": {"shop_money": {"amount": "199.00", "currency_code": "USD"}, "presentment_money": {"amount": "199.00", "currency_code": "USD"}}, "total_discount_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "discount_allocations": [{"amount": "3.33", "discount_application_index": 0, "amount_set": {"shop_money": {"amount": "3.33", "currency_code": "USD"}, "presentment_money": {"amount": "3.33", "currency_code": "USD"}}}], "duties": [], "admin_graphql_api_id": "gid://shopify/LineItem/703073504", "tax_lines": [{"title": "State Tax", "price": "3.98", "rate": 0.06, "channel_liable": null, "price_set": {"shop_money": {"amount": "3.98", "currency_code": "USD"}, "presentment_money": {"amount": "3.98", "currency_code": "USD"}}}]}}, {"id": 709875399, "quantity": 1, "line_item_id": 466157049, "location_id": 487838322, "restock_type": "legacy_restock", "subtotal": 195.67, "total_tax": 3.98, "subtotal_set": {"shop_money": {"amount": "195.67", "currency_code": "USD"}, "presentment_money": {"amount": "195.67", "currency_code": "USD"}}, "total_tax_set": {"shop_money": {"amount": "3.98", "currency_code": "USD"}, "presentment_money": {"amount": "3.98", "currency_code": "USD"}}, "line_item": {"id": 466157049, "variant_id": 39072856, "title": "IPod Nano - 8gb", "quantity": 1, "sku": "IPOD2008GREEN", "variant_title": "green", "vendor": null, "fulfillment_service": "manual", "product_id": 632910392, "requires_shipping": true, "taxable": true, "gift_card": false, "name": "IPod Nano - 8gb - green", "variant_inventory_management": "shopify", "properties": [{"name": "Custom Engraving Front", "value": "Happy Birthday"}, {"name": "Custom Engraving Back", "value": "Merry Christmas"}], "product_exists": true, "fulfillable_quantity": 1, "grams": 200, "price": "199.00", "total_discount": "0.00", "fulfillment_status": null, "price_set": {"shop_money": {"amount": "199.00", "currency_code": "USD"}, "presentment_money": {"amount": "199.00", "currency_code": "USD"}}, "total_discount_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "discount_allocations": [{"amount": "3.34", "discount_application_index": 0, "amount_set": {"shop_money": {"amount": "3.34", "currency_code": "USD"}, "presentment_money": {"amount": "3.34", "currency_code": "USD"}}}], "duties": [], "admin_graphql_api_id": "gid://shopify/LineItem/466157049", "tax_lines": [{"title": "State Tax", "price": "3.98", "rate": 0.06, "channel_liable": null, "price_set": {"shop_money": {"amount": "3.98", "currency_code": "USD"}, "presentment_money": {"amount": "3.98", "currency_code": "USD"}}}]}}], "transactions": [{"id": 179259969, "order_id": 450789469, "kind": "refund", "gateway": "bogus", "status": "success", "message": null, "created_at": "2005-08-05T12:59:12-04:00", "test": false, "authorization": "authorization-key", "location_id": null, "user_id": null, "parent_id": 801038806, "processed_at": "2005-08-05T12:59:12-04:00", "device_id": null, "error_code": null, "source_name": "web", "receipt": {}, "amount": "209.00", "currency": "USD", "payment_id": "#1001.3", "total_unsettled_set": {"presentment_money": {"amount": "348.0", "currency": "USD"}, "shop_money": {"amount": "348.0", "currency": "USD"}}, "manual_payment_gateway": false, "amount_rounding": null, "admin_graphql_api_id": "gid://shopify/OrderTransaction/179259969"}]}}));

    await shopify.rest.Refund.find({
      session: session,
      order_id: 450789469,
      id: 509562969,
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-04/orders/450789469/refunds/509562969.json',
      query: '',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_5', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"refund": {"duties": [], "total_duties_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "return": null, "shipping": {"amount": "2.00", "tax": "0.00", "maximum_refundable": "5.00"}, "additional_fees": [], "total_additional_fees_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "refund_shipping_lines": [{"id": null, "shipping_line_id": 369256396, "subtotal_amount_set": {"shop_money": {"amount": "2.00", "currency_code": "USD"}, "presentment_money": {"amount": "2.00", "currency_code": "USD"}}, "shipping_line": {"id": 369256396, "carrier_identifier": null, "code": "Free Shipping", "discounted_price": "5.00", "discounted_price_set": {"shop_money": {"amount": "5.00", "currency_code": "USD"}, "presentment_money": {"amount": "5.00", "currency_code": "USD"}}, "phone": null, "price": "5.00", "price_set": {"shop_money": {"amount": "5.00", "currency_code": "USD"}, "presentment_money": {"amount": "5.00", "currency_code": "USD"}}, "requested_fulfillment_service_id": null, "source": "shopify", "title": "Free Shipping", "tax_lines": [], "discount_allocations": []}}], "refund_line_items": [], "transactions": [{"order_id": 450789469, "kind": "suggested_refund", "gateway": "bogus", "parent_id": 801038806, "amount": "2.00", "currency": "USD", "maximum_refundable": "41.94"}], "currency": "USD"}}));

    const refund = new shopify.rest.Refund({session: session});
    refund.order_id = 450789469;
    await refund.calculate({
      body: {"refund": {"currency": "USD", "shipping": {"amount": 2.0}}},
    });

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-04/orders/450789469/refunds/calculate.json',
      query: '',
      headers,
      data: { "refund": {"currency": "USD", "shipping": {"amount": 2.0}} }
    }).toMatchMadeHttpRequest();
  });

  it('test_6', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"refund": {"duties": [], "total_duties_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "return": null, "shipping": {"amount": "0.00", "tax": "0.00", "maximum_refundable": "0.00"}, "additional_fees": [], "total_additional_fees_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "refund_shipping_lines": [], "refund_line_items": [{"quantity": 1, "line_item_id": 518995019, "location_id": null, "restock_type": "no_restock", "price": "199.00", "subtotal": "195.67", "total_tax": "3.98", "discounted_price": "199.00", "discounted_total_price": "199.00", "total_cart_discount_amount": "3.33"}], "transactions": [{"order_id": 450789469, "kind": "suggested_refund", "gateway": "bogus", "parent_id": 801038806, "amount": "41.94", "currency": "USD", "maximum_refundable": "41.94"}], "currency": "USD"}}));

    const refund = new shopify.rest.Refund({session: session});
    refund.order_id = 450789469;
    await refund.calculate({
      body: {"refund": {"currency": "USD", "shipping": {"full_refund": true}, "refund_line_items": [{"line_item_id": 518995019, "quantity": 1, "restock_type": "no_restock"}]}},
    });

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-04/orders/450789469/refunds/calculate.json',
      query: '',
      headers,
      data: { "refund": {"currency": "USD", "shipping": {"full_refund": true}, "refund_line_items": [{"line_item_id": 518995019, "quantity": 1, "restock_type": "no_restock"}]} }
    }).toMatchMadeHttpRequest();
  });

  it('test_7', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"refund": {"duties": [], "total_duties_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "return": null, "shipping": {"amount": "0.00", "tax": "0.00", "maximum_refundable": "0.00"}, "additional_fees": [], "total_additional_fees_set": {"shop_money": {"amount": "0.00", "currency_code": "USD"}, "presentment_money": {"amount": "0.00", "currency_code": "USD"}}, "refund_shipping_lines": [], "refund_line_items": [{"quantity": 1, "line_item_id": 518995019, "location_id": null, "restock_type": "no_restock", "price": "199.00", "subtotal": "195.67", "total_tax": "3.98", "discounted_price": "199.00", "discounted_total_price": "199.00", "total_cart_discount_amount": "3.33"}], "transactions": [{"order_id": 450789469, "kind": "suggested_refund", "gateway": "bogus", "parent_id": 801038806, "amount": "41.94", "currency": "USD", "maximum_refundable": "41.94"}], "currency": "USD"}}));

    const refund = new shopify.rest.Refund({session: session});
    refund.order_id = 450789469;
    await refund.calculate({
      body: {"refund": {"shipping": {"full_refund": true}, "refund_line_items": [{"line_item_id": 518995019, "quantity": 1, "restock_type": "no_restock"}]}},
    });

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-04/orders/450789469/refunds/calculate.json',
      query: '',
      headers,
      data: { "refund": {"shipping": {"full_refund": true}, "refund_line_items": [{"line_item_id": 518995019, "quantity": 1, "restock_type": "no_restock"}]} }
    }).toMatchMadeHttpRequest();
  });

});
