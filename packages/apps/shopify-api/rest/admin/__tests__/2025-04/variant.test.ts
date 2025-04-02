/***********************************************************************************************************************
* This file is auto-generated. If you have an issue, please create a GitHub issue.                                     *
***********************************************************************************************************************/

import {Session} from '../../../../lib/session/session';
import {queueMockResponse} from '../../../../lib/__tests__/test-helper';
import {testConfig} from '../../../../lib/__tests__/test-config';
import {ApiVersion} from '../../../../lib/types';
import {shopifyApi} from '../../../../lib';

import {restResources} from '../../2025-04';

describe('Variant resource', () => {
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

    queueMockResponse(JSON.stringify({"variants": [{"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": null, "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:38:15-05:00", "updated_at": "2025-04-02T11:38:15-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": null, "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:38:15-05:00", "updated_at": "2025-04-02T11:38:15-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:38:15-05:00", "updated_at": "2025-04-02T11:38:15-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}, {"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:38:15-05:00", "updated_at": "2025-04-02T11:38:15-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}]}));

    await shopify.rest.Variant.all({
      session: session,
      product_id: 632910392,
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-04/products/632910392/variants.json',
      query: '',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_2', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"variants": [{"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:38:15-05:00", "updated_at": "2025-04-02T11:38:15-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}, {"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:38:15-05:00", "updated_at": "2025-04-02T11:38:15-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}]}));

    await shopify.rest.Variant.all({
      session: session,
      product_id: 632910392,
      since_id: "49148385",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-04/products/632910392/variants.json',
      query: 'since_id=49148385',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_3', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"variants": [{"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": "249.00", "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:38:15-05:00", "updated_at": "2025-04-02T11:38:15-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": {"amount": "249.00", "currency_code": "USD"}}, {"price": {"amount": "249.00", "currency_code": "CAD"}, "compare_at_price": {"amount": "312.00", "currency_code": "CAD"}}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": "249.00", "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:38:15-05:00", "updated_at": "2025-04-02T11:38:15-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": {"amount": "249.00", "currency_code": "USD"}}, {"price": {"amount": "249.00", "currency_code": "CAD"}, "compare_at_price": {"amount": "312.00", "currency_code": "CAD"}}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": "249.00", "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:38:15-05:00", "updated_at": "2025-04-02T11:38:15-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": {"amount": "249.00", "currency_code": "USD"}}, {"price": {"amount": "249.00", "currency_code": "CAD"}, "compare_at_price": {"amount": "312.00", "currency_code": "CAD"}}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}, {"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": "249.00", "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:38:15-05:00", "updated_at": "2025-04-02T11:38:15-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": {"amount": "249.00", "currency_code": "USD"}}, {"price": {"amount": "249.00", "currency_code": "CAD"}, "compare_at_price": {"amount": "312.00", "currency_code": "CAD"}}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}]}));

    await shopify.rest.Variant.all({
      session: session,
      product_id: 632910392,
      presentment_currencies: "USD,CAD",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-04/products/632910392/variants.json',
      query: 'presentment_currencies=USD%2CCAD',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_4', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"variant": {"id": 1070325042, "product_id": 632910392, "title": "Yellow", "price": "1.00", "position": 5, "inventory_policy": "deny", "compare_at_price": null, "option1": "Yellow", "option2": null, "option3": null, "created_at": "2025-04-02T11:39:09-05:00", "updated_at": "2025-04-02T11:39:10-05:00", "taxable": true, "barcode": null, "fulfillment_service": "manual", "grams": 0, "inventory_management": "shopify", "requires_shipping": true, "sku": null, "weight": 0.0, "weight_unit": "lb", "inventory_item_id": 1070325042, "inventory_quantity": 0, "old_inventory_quantity": 0, "presentment_prices": [{"price": {"amount": "1.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/1070325042", "image_id": null}}));

    const variant = new shopify.rest.Variant({session: session});
    variant.product_id = 632910392;
    variant.option1 = "Yellow";
    variant.price = "1.00";
    await variant.save({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-04/products/632910392/variants.json',
      query: '',
      headers,
      data: { "variant": {"option1": "Yellow", "price": "1.00"} }
    }).toMatchMadeHttpRequest();
  });

  it('test_5', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"variant": {"id": 1070325039, "product_id": 632910392, "title": "Blue", "price": "0.00", "position": 5, "inventory_policy": "deny", "compare_at_price": null, "option1": "Blue", "option2": null, "option3": null, "created_at": "2025-04-02T11:39:01-05:00", "updated_at": "2025-04-02T11:39:01-05:00", "taxable": true, "barcode": null, "fulfillment_service": "manual", "grams": 0, "inventory_management": "shopify", "requires_shipping": true, "sku": null, "weight": 0.0, "weight_unit": "lb", "inventory_item_id": 1070325039, "inventory_quantity": 0, "old_inventory_quantity": 0, "presentment_prices": [{"price": {"amount": "0.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/1070325039", "image_id": null}}));

    const variant = new shopify.rest.Variant({session: session});
    variant.product_id = 632910392;
    variant.option1 = "Blue";
    variant.metafields = [
      {
        "key": "new",
        "value": "newvalue",
        "type": "single_line_text_field",
        "namespace": "global"
      }
    ];
    await variant.save({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-04/products/632910392/variants.json',
      query: '',
      headers,
      data: { "variant": {"option1": "Blue", "metafields": [{"key": "new", "value": "newvalue", "type": "single_line_text_field", "namespace": "global"}]} }
    }).toMatchMadeHttpRequest();
  });

  it('test_6', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"variant": {"id": 1070325040, "product_id": 632910392, "title": "Purple", "price": "0.00", "position": 5, "inventory_policy": "deny", "compare_at_price": null, "option1": "Purple", "option2": null, "option3": null, "created_at": "2025-04-02T11:39:02-05:00", "updated_at": "2025-04-02T11:39:02-05:00", "taxable": true, "barcode": null, "fulfillment_service": "manual", "grams": 0, "inventory_management": "shopify", "requires_shipping": true, "sku": null, "weight": 0.0, "weight_unit": "lb", "inventory_item_id": 1070325040, "inventory_quantity": 0, "old_inventory_quantity": 0, "presentment_prices": [{"price": {"amount": "0.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/1070325040", "image_id": 850703190}}));

    const variant = new shopify.rest.Variant({session: session});
    variant.product_id = 632910392;
    variant.image_id = 850703190;
    variant.option1 = "Purple";
    await variant.save({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-04/products/632910392/variants.json',
      query: '',
      headers,
      data: { "variant": {"image_id": 850703190, "option1": "Purple"} }
    }).toMatchMadeHttpRequest();
  });

  it('test_7', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"count": 4}));

    await shopify.rest.Variant.count({
      session: session,
      product_id: 632910392,
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-04/products/632910392/variants/count.json',
      query: '',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_8', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"variant": {"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:38:15-05:00", "updated_at": "2025-04-02T11:38:15-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "tax_code": "DA040000", "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}}));

    await shopify.rest.Variant.find({
      session: session,
      id: 808950810,
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-04/variants/808950810.json',
      query: '',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_9', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"variant": {"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:38:15-05:00", "updated_at": "2025-04-02T11:38:15-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}}));

    const variant = new shopify.rest.Variant({session: session});
    variant.id = 808950810;
    variant.metafields = [
      {
        "key": "new",
        "value": "newvalue",
        "type": "single_line_text_field",
        "namespace": "global"
      }
    ];
    await variant.save({});

    expect({
      method: 'PUT',
      domain,
      path: '/admin/api/2025-04/variants/808950810.json',
      query: '',
      headers,
      data: { "variant": {"metafields": [{"key": "new", "value": "newvalue", "type": "single_line_text_field", "namespace": "global"}]} }
    }).toMatchMadeHttpRequest();
  });

  it('test_10', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"variant": {"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:38:15-05:00", "updated_at": "2025-04-02T11:39:08-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}}));

    const variant = new shopify.rest.Variant({session: session});
    variant.id = 808950810;
    variant.image_id = 562641783;
    await variant.save({});

    expect({
      method: 'PUT',
      domain,
      path: '/admin/api/2025-04/variants/808950810.json',
      query: '',
      headers,
      data: { "variant": {"image_id": 562641783} }
    }).toMatchMadeHttpRequest();
  });

  it('test_11', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({"variant": {"id": 808950810, "product_id": 632910392, "title": "Not Pink", "price": "99.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Not Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:38:15-05:00", "updated_at": "2025-04-02T11:39:07-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "99.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}}));

    const variant = new shopify.rest.Variant({session: session});
    variant.id = 808950810;
    variant.option1 = "Not Pink";
    variant.price = "99.00";
    await variant.save({});

    expect({
      method: 'PUT',
      domain,
      path: '/admin/api/2025-04/variants/808950810.json',
      query: '',
      headers,
      data: { "variant": {"option1": "Not Pink", "price": "99.00"} }
    }).toMatchMadeHttpRequest();
  });

  it('test_12', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.April25, restResources}),
    );

    queueMockResponse(JSON.stringify({}));

    await shopify.rest.Variant.delete({
      session: session,
      product_id: 632910392,
      id: 808950810,
    });

    expect({
      method: 'DELETE',
      domain,
      path: '/admin/api/2025-04/products/632910392/variants/808950810.json',
      query: '',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

});
