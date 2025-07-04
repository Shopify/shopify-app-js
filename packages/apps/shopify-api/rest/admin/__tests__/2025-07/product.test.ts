/***********************************************************************************************************************
* This file is auto-generated. If you have an issue, please create a GitHub issue.                                     *
***********************************************************************************************************************/

import {Session} from '../../../../lib/session/session';
import {queueMockResponse} from '../../../../lib/__tests__/test-helper';
import {testConfig} from '../../../../lib/__tests__/test-config';
import {ApiVersion} from '../../../../lib/types';
import {shopifyApi} from '../../../../lib';

import {restResources} from '../../2025-07';

describe('Product resource', () => {
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

    queueMockResponse(JSON.stringify({"products": [{"id": 632910392, "title": "IPod Nano - 8GB", "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-nano", "updated_at": "2025-04-02T11:29:59-05:00", "published_at": "2007-12-31T19:00:00-05:00", "template_suffix": null, "published_scope": "web", "tags": "Emotive, Flash Memory, MP3, Music", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/632910392", "variants": [{"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": null, "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": null, "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}], "options": [{"id": 594680422, "product_id": 632910392, "name": "Color", "position": 1, "values": ["Pink", "Red", "Green", "Black"]}], "images": [{"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 562641783, "alt": null, "position": 2, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1735835399", "variant_ids": [808950810]}, {"id": 378407906, "alt": null, "position": 3, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}], "image": {"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}}, {"id": 921728736, "title": "IPod Touch 8GB", "body_html": "<p>The iPod Touch has the iPhone's multi-touch interface, with a physical home button off the touch screen. The home screen has a list of buttons for the available applications.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-touch", "updated_at": "2025-04-02T11:29:59-05:00", "published_at": "2008-09-25T20:00:00-04:00", "template_suffix": null, "published_scope": "web", "tags": "", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/921728736", "variants": [{"id": 447654529, "product_id": 921728736, "title": "Black", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2009BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 447654529, "inventory_quantity": 13, "old_inventory_quantity": 13, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/447654529", "image_id": null}], "options": [{"id": 891236591, "product_id": 921728736, "name": "Title", "position": 1, "values": ["Black"]}], "images": [], "image": null}]}));

    await shopify.rest.Product.all({
      session: session,
      ids: "632910392,921728736",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-07/products.json',
      query: 'ids=632910392%2C921728736',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_2', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"products": [{"id": 632910392, "title": "IPod Nano - 8GB", "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-nano", "updated_at": "2025-04-02T11:29:59-05:00", "published_at": "2007-12-31T19:00:00-05:00", "template_suffix": null, "published_scope": "web", "tags": "Emotive, Flash Memory, MP3, Music", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/632910392", "variants": [{"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": null, "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": null, "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}], "options": [{"id": 594680422, "product_id": 632910392, "name": "Color", "position": 1, "values": ["Pink", "Red", "Green", "Black"]}], "images": [{"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 562641783, "alt": null, "position": 2, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1735835399", "variant_ids": [808950810]}, {"id": 378407906, "alt": null, "position": 3, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}], "image": {"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}}, {"id": 921728736, "title": "IPod Touch 8GB", "body_html": "<p>The iPod Touch has the iPhone's multi-touch interface, with a physical home button off the touch screen. The home screen has a list of buttons for the available applications.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-touch", "updated_at": "2025-04-02T11:29:59-05:00", "published_at": "2008-09-25T20:00:00-04:00", "template_suffix": null, "published_scope": "web", "tags": "", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/921728736", "variants": [{"id": 447654529, "product_id": 921728736, "title": "Black", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2009BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 447654529, "inventory_quantity": 13, "old_inventory_quantity": 13, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/447654529", "image_id": null}], "options": [{"id": 891236591, "product_id": 921728736, "name": "Title", "position": 1, "values": ["Black"]}], "images": [], "image": null}]}));

    await shopify.rest.Product.all({
      session: session,
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-07/products.json',
      query: '',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_3', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"products": [{"id": 921728736, "title": "IPod Touch 8GB", "body_html": "<p>The iPod Touch has the iPhone's multi-touch interface, with a physical home button off the touch screen. The home screen has a list of buttons for the available applications.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-touch", "updated_at": "2025-04-02T11:29:59-05:00", "published_at": "2008-09-25T20:00:00-04:00", "template_suffix": null, "published_scope": "web", "tags": "", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/921728736", "variants": [{"id": 447654529, "product_id": 921728736, "title": "Black", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2009BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 447654529, "inventory_quantity": 13, "old_inventory_quantity": 13, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/447654529", "image_id": null}], "options": [{"id": 891236591, "product_id": 921728736, "name": "Title", "position": 1, "values": ["Black"]}], "images": [], "image": null}]}));

    await shopify.rest.Product.all({
      session: session,
      since_id: "632910392",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-07/products.json',
      query: 'since_id=632910392',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_4', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"products": [{"id": 632910392, "title": "IPod Nano - 8GB", "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-nano", "updated_at": "2025-04-02T11:29:59-05:00", "published_at": "2007-12-31T19:00:00-05:00", "template_suffix": null, "published_scope": "web", "tags": "Emotive, Flash Memory, MP3, Music", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/632910392", "variants": [{"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": null, "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": null, "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}], "options": [{"id": 594680422, "product_id": 632910392, "name": "Color", "position": 1, "values": ["Pink", "Red", "Green", "Black"]}], "images": [{"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 562641783, "alt": null, "position": 2, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1735835399", "variant_ids": [808950810]}, {"id": 378407906, "alt": null, "position": 3, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}], "image": {"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}}]}));

    await shopify.rest.Product.all({
      session: session,
      collection_id: "841564295",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-07/products.json',
      query: 'collection_id=841564295',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_5', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"products": [{"id": 632910392, "title": "IPod Nano - 8GB", "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-nano", "updated_at": "2025-04-02T11:29:59-05:00", "published_at": "2007-12-31T19:00:00-05:00", "template_suffix": null, "published_scope": "web", "tags": "Emotive, Flash Memory, MP3, Music", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/632910392", "variants": [{"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": null, "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": null, "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}], "options": [{"id": 594680422, "product_id": 632910392, "name": "Color", "position": 1, "values": ["Pink", "Red", "Green", "Black"]}], "images": [{"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 562641783, "alt": null, "position": 2, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1735835399", "variant_ids": [808950810]}, {"id": 378407906, "alt": null, "position": 3, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}], "image": {"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}}, {"id": 921728736, "title": "IPod Touch 8GB", "body_html": "<p>The iPod Touch has the iPhone's multi-touch interface, with a physical home button off the touch screen. The home screen has a list of buttons for the available applications.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-touch", "updated_at": "2025-04-02T11:29:59-05:00", "published_at": "2008-09-25T20:00:00-04:00", "template_suffix": null, "published_scope": "web", "tags": "", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/921728736", "variants": [{"id": 447654529, "product_id": 921728736, "title": "Black", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2009BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 447654529, "inventory_quantity": 13, "old_inventory_quantity": 13, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/447654529", "image_id": null}], "options": [{"id": 891236591, "product_id": 921728736, "name": "Title", "position": 1, "values": ["Black"]}], "images": [], "image": null}]}));

    await shopify.rest.Product.all({
      session: session,
      presentment_currencies: "USD",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-07/products.json',
      query: 'presentment_currencies=USD',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_6', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"products": [{"id": 632910392, "title": "IPod Nano - 8GB", "images": [{"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 562641783, "alt": null, "position": 2, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1735835399", "variant_ids": [808950810]}, {"id": 378407906, "alt": null, "position": 3, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}]}, {"id": 921728736, "title": "IPod Touch 8GB", "images": []}]}));

    await shopify.rest.Product.all({
      session: session,
      fields: "id,images,title",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-07/products.json',
      query: 'fields=id%2Cimages%2Ctitle',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_7', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"count": 2}));

    await shopify.rest.Product.count({
      session: session,
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-07/products/count.json',
      query: '',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_8', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"count": 1}));

    await shopify.rest.Product.count({
      session: session,
      collection_id: "841564295",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-07/products/count.json',
      query: 'collection_id=841564295',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_9', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 632910392, "title": "IPod Nano - 8GB", "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-nano", "updated_at": "2025-04-02T11:29:59-05:00", "published_at": "2007-12-31T19:00:00-05:00", "template_suffix": null, "published_scope": "web", "tags": "Emotive, Flash Memory, MP3, Music", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/632910392", "variants": [{"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": null, "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": null, "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}], "options": [{"id": 594680422, "product_id": 632910392, "name": "Color", "position": 1, "values": ["Pink", "Red", "Green", "Black"]}], "images": [{"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 562641783, "alt": null, "position": 2, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1735835399", "variant_ids": [808950810]}, {"id": 378407906, "alt": null, "position": 3, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}], "image": {"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}}}));

    await shopify.rest.Product.find({
      session: session,
      id: 632910392,
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-07/products/632910392.json',
      query: '',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_10', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 632910392, "title": "IPod Nano - 8GB", "images": [{"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 562641783, "alt": null, "position": 2, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1735835399", "variant_ids": [808950810]}, {"id": 378407906, "alt": null, "position": 3, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}]}}));

    await shopify.rest.Product.find({
      session: session,
      id: 632910392,
      fields: "id,images,title",
    });

    expect({
      method: 'GET',
      domain,
      path: '/admin/api/2025-07/products/632910392.json',
      query: 'fields=id%2Cimages%2Ctitle',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_11', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 632910392, "title": "IPod Nano - 8GB", "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-nano", "updated_at": "2025-04-02T11:35:57-05:00", "published_at": "2007-12-31T19:00:00-05:00", "template_suffix": null, "published_scope": "web", "tags": "Emotive, Flash Memory, MP3, Music", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/632910392", "variants": [{"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": null, "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": null, "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}], "options": [{"id": 594680422, "product_id": 632910392, "name": "Color", "position": 1, "values": ["Pink", "Red", "Green", "Black"]}], "images": [{"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 562641783, "alt": null, "position": 2, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1735835399", "variant_ids": [808950810]}, {"id": 378407906, "alt": null, "position": 3, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}], "image": {"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}}}));

    const product = new shopify.rest.Product({session: session});
    product.id = 632910392;
    product.metafields = [
      {
        "key": "new",
        "value": "newvalue",
        "type": "single_line_text_field",
        "namespace": "global"
      }
    ];
    await product.save({});

    expect({
      method: 'PUT',
      domain,
      path: '/admin/api/2025-07/products/632910392.json',
      query: '',
      headers,
      data: { "product": {"metafields": [{"key": "new", "value": "newvalue", "type": "single_line_text_field", "namespace": "global"}]} }
    }).toMatchMadeHttpRequest();
  });

  it('test_12', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 632910392, "title": "IPod Nano - 8GB", "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-nano", "updated_at": "2025-04-02T11:36:09-05:00", "published_at": null, "template_suffix": null, "published_scope": "web", "tags": "Emotive, Flash Memory, MP3, Music", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/632910392", "variants": [{"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": null, "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": null, "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}], "options": [{"id": 594680422, "product_id": 632910392, "name": "Color", "position": 1, "values": ["Pink", "Red", "Green", "Black"]}], "images": [{"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 562641783, "alt": null, "position": 2, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1735835399", "variant_ids": [808950810]}, {"id": 378407906, "alt": null, "position": 3, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}], "image": {"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}}}));

    const product = new shopify.rest.Product({session: session});
    product.id = 632910392;
    product.published = false;
    await product.save({});

    expect({
      method: 'PUT',
      domain,
      path: '/admin/api/2025-07/products/632910392.json',
      query: '',
      headers,
      data: { "product": {"published": false} }
    }).toMatchMadeHttpRequest();
  });

  it('test_13', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 632910392, "title": "IPod Nano - 8GB", "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-nano", "updated_at": "2025-04-02T11:36:41-05:00", "published_at": "2025-04-02T11:36:41-05:00", "template_suffix": null, "published_scope": "web", "tags": "Emotive, Flash Memory, MP3, Music", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/632910392", "variants": [{"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": null, "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": null, "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}], "options": [{"id": 594680422, "product_id": 632910392, "name": "Color", "position": 1, "values": ["Pink", "Red", "Green", "Black"]}], "images": [{"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 562641783, "alt": null, "position": 2, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1735835399", "variant_ids": [808950810]}, {"id": 378407906, "alt": null, "position": 3, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}], "image": {"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}}}));

    const product = new shopify.rest.Product({session: session});
    product.id = 632910392;
    product.published = true;
    await product.save({});

    expect({
      method: 'PUT',
      domain,
      path: '/admin/api/2025-07/products/632910392.json',
      query: '',
      headers,
      data: { "product": {"published": true} }
    }).toMatchMadeHttpRequest();
  });

  it('test_14', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 632910392, "title": "Updated Product Title", "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-nano", "updated_at": "2025-04-02T11:36:40-05:00", "published_at": "2007-12-31T19:00:00-05:00", "template_suffix": null, "published_scope": "web", "tags": "Emotive, Flash Memory, MP3, Music", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/632910392", "variants": [{"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "2000.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:36:40-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "Updating the Product SKU", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "2000.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": null, "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": null, "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}], "options": [{"id": 594680422, "product_id": 632910392, "name": "Color", "position": 1, "values": ["Pink", "Red", "Green", "Black"]}], "images": [{"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 562641783, "alt": null, "position": 2, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1735835399", "variant_ids": [808950810]}, {"id": 378407906, "alt": null, "position": 3, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}], "image": {"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}}}));

    const product = new shopify.rest.Product({session: session});
    product.id = 632910392;
    product.title = "Updated Product Title";
    product.variants = [
      {
        "id": 808950810,
        "price": "2000.00",
        "sku": "Updating the Product SKU"
      },
      {
        "id": 49148385
      },
      {
        "id": 39072856
      },
      {
        "id": 457924702
      }
    ];
    await product.save({});

    expect({
      method: 'PUT',
      domain,
      path: '/admin/api/2025-07/products/632910392.json',
      query: '',
      headers,
      data: { "product": {"title": "Updated Product Title", "variants": [{"id": 808950810, "price": "2000.00", "sku": "Updating the Product SKU"}, {"id": 49148385}, {"id": 39072856}, {"id": 457924702}]} }
    }).toMatchMadeHttpRequest();
  });

  it('test_15', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 632910392, "title": "IPod Nano - 8GB", "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-nano", "updated_at": "2025-04-02T11:36:58-05:00", "published_at": "2007-12-31T19:00:00-05:00", "template_suffix": null, "published_scope": "web", "tags": "Emotive, Flash Memory, MP3, Music", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/632910392", "variants": [{"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": null, "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": null, "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}], "options": [{"id": 594680422, "product_id": 632910392, "name": "Color", "position": 1, "values": ["Pink", "Red", "Green", "Black"]}], "images": [{"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 562641783, "alt": null, "position": 2, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1735835399", "variant_ids": [808950810]}, {"id": 378407906, "alt": null, "position": 3, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 1001473910, "alt": null, "position": 4, "product_id": 632910392, "created_at": "2025-04-02T11:36:58-05:00", "updated_at": "2025-04-02T11:36:58-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1072273207", "width": 110, "height": 140, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/files/rails_logo20250102-63224-i8ga8z.gif?v=1735835818", "variant_ids": []}], "image": {"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}}}));

    const product = new shopify.rest.Product({session: session});
    product.id = 632910392;
    product.images = [
      {
        "id": 850703190
      },
      {
        "id": 562641783
      },
      {
        "id": 378407906
      },
      {
        "src": "http://example.com/rails_logo.gif"
      }
    ];
    await product.save({});

    expect({
      method: 'PUT',
      domain,
      path: '/admin/api/2025-07/products/632910392.json',
      query: '',
      headers,
      data: { "product": {"images": [{"id": 850703190}, {"id": 562641783}, {"id": 378407906}, {"src": "http://example.com/rails_logo.gif"}]} }
    }).toMatchMadeHttpRequest();
  });

  it('test_16', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 632910392, "title": "IPod Nano - 8GB", "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-nano", "updated_at": "2025-04-02T11:35:58-05:00", "published_at": "2007-12-31T19:00:00-05:00", "template_suffix": null, "published_scope": "web", "tags": "Emotive, Flash Memory, MP3, Music", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/632910392", "variants": [{"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:35:58-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": null}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": null, "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": null, "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}], "options": [{"id": 594680422, "product_id": 632910392, "name": "Color", "position": 1, "values": ["Pink", "Red", "Green", "Black"]}], "images": [], "image": null}}));

    const product = new shopify.rest.Product({session: session});
    product.id = 632910392;
    product.images = [];
    await product.save({});

    expect({
      method: 'PUT',
      domain,
      path: '/admin/api/2025-07/products/632910392.json',
      query: '',
      headers,
      data: { "product": {"images": []} }
    }).toMatchMadeHttpRequest();
  });

  it('test_17', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 632910392, "title": "IPod Nano - 8GB", "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-nano", "updated_at": "2025-04-02T11:36:44-05:00", "published_at": "2007-12-31T19:00:00-05:00", "template_suffix": null, "published_scope": "web", "tags": "Emotive, Flash Memory, MP3, Music", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/632910392", "variants": [{"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": null, "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": null, "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}], "options": [{"id": 594680422, "product_id": 632910392, "name": "Color", "position": 1, "values": ["Pink", "Red", "Green", "Black"]}], "images": [{"id": 378407906, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:36:44-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 850703190, "alt": null, "position": 2, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:36:44-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835804", "variant_ids": []}, {"id": 562641783, "alt": null, "position": 3, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1735835399", "variant_ids": [808950810]}], "image": {"id": 378407906, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:36:44-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}}}));

    const product = new shopify.rest.Product({session: session});
    product.id = 632910392;
    product.images = [
      {
        "id": 850703190,
        "position": 3
      },
      {
        "id": 562641783,
        "position": 2
      },
      {
        "id": 378407906,
        "position": 1
      }
    ];
    await product.save({});

    expect({
      method: 'PUT',
      domain,
      path: '/admin/api/2025-07/products/632910392.json',
      query: '',
      headers,
      data: { "product": {"images": [{"id": 850703190, "position": 3}, {"id": 562641783, "position": 2}, {"id": 378407906, "position": 1}]} }
    }).toMatchMadeHttpRequest();
  });

  it('test_18', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 632910392, "title": "IPod Nano - 8GB", "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-nano", "updated_at": "2025-04-02T11:36:38-05:00", "published_at": "2007-12-31T19:00:00-05:00", "template_suffix": null, "published_scope": "web", "tags": "Emotive, Flash Memory, MP3, Music", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/632910392", "variants": [{"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:36:38-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}, {"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": null, "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:36:38-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": null, "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:36:38-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:36:38-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}], "options": [{"id": 594680422, "product_id": 632910392, "name": "Color", "position": 1, "values": ["Black", "Green", "Red", "Pink"]}], "images": [{"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 562641783, "alt": null, "position": 2, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1735835399", "variant_ids": [808950810]}, {"id": 378407906, "alt": null, "position": 3, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}], "image": {"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}}}));

    const product = new shopify.rest.Product({session: session});
    product.id = 632910392;
    product.variants = [
      {
        "id": 457924702
      },
      {
        "id": 39072856
      },
      {
        "id": 49148385
      },
      {
        "id": 808950810
      }
    ];
    await product.save({});

    expect({
      method: 'PUT',
      domain,
      path: '/admin/api/2025-07/products/632910392.json',
      query: '',
      headers,
      data: { "product": {"variants": [{"id": 457924702}, {"id": 39072856}, {"id": 49148385}, {"id": 808950810}]} }
    }).toMatchMadeHttpRequest();
  });

  it('test_19', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 632910392, "title": "IPod Nano - 8GB", "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-nano", "updated_at": "2025-04-02T11:29:59-05:00", "published_at": "2007-12-31T19:00:00-05:00", "template_suffix": null, "published_scope": "web", "tags": "Emotive, Flash Memory, MP3, Music", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/632910392", "variants": [{"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": null, "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": null, "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}], "options": [{"id": 594680422, "product_id": 632910392, "name": "Color", "position": 1, "values": ["Pink", "Red", "Green", "Black"]}], "images": [{"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 562641783, "alt": null, "position": 2, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1735835399", "variant_ids": [808950810]}, {"id": 378407906, "alt": null, "position": 3, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}], "image": {"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}}}));

    const product = new shopify.rest.Product({session: session});
    product.id = 632910392;
    product.metafields_global_title_tag = "Brand new title";
    product.metafields_global_description_tag = "Brand new description";
    await product.save({});

    expect({
      method: 'PUT',
      domain,
      path: '/admin/api/2025-07/products/632910392.json',
      query: '',
      headers,
      data: { "product": {"metafields_global_title_tag": "Brand new title", "metafields_global_description_tag": "Brand new description"} }
    }).toMatchMadeHttpRequest();
  });

  it('test_20', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 632910392, "title": "IPod Nano - 8GB", "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-nano", "updated_at": "2025-04-02T11:36:49-05:00", "published_at": null, "template_suffix": null, "published_scope": "web", "tags": "Emotive, Flash Memory, MP3, Music", "status": "draft", "admin_graphql_api_id": "gid://shopify/Product/632910392", "variants": [{"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": null, "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": null, "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}], "options": [{"id": 594680422, "product_id": 632910392, "name": "Color", "position": 1, "values": ["Pink", "Red", "Green", "Black"]}], "images": [{"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 562641783, "alt": null, "position": 2, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1735835399", "variant_ids": [808950810]}, {"id": 378407906, "alt": null, "position": 3, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}], "image": {"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}}}));

    const product = new shopify.rest.Product({session: session});
    product.id = 632910392;
    product.status = "draft";
    await product.save({});

    expect({
      method: 'PUT',
      domain,
      path: '/admin/api/2025-07/products/632910392.json',
      query: '',
      headers,
      data: { "product": {"status": "draft"} }
    }).toMatchMadeHttpRequest();
  });

  it('test_21', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 632910392, "title": "IPod Nano - 8GB", "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-nano", "updated_at": "2025-04-02T11:36:13-05:00", "published_at": "2007-12-31T19:00:00-05:00", "template_suffix": null, "published_scope": "web", "tags": "Barnes & Noble, John's Fav", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/632910392", "variants": [{"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": null, "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": null, "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}], "options": [{"id": 594680422, "product_id": 632910392, "name": "Color", "position": 1, "values": ["Pink", "Red", "Green", "Black"]}], "images": [{"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 562641783, "alt": null, "position": 2, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1735835399", "variant_ids": [808950810]}, {"id": 378407906, "alt": null, "position": 3, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}], "image": {"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}}}));

    const product = new shopify.rest.Product({session: session});
    product.id = 632910392;
    product.tags = "Barnes & Noble, John's Fav";
    await product.save({});

    expect({
      method: 'PUT',
      domain,
      path: '/admin/api/2025-07/products/632910392.json',
      query: '',
      headers,
      data: { "product": {"tags": "Barnes & Noble, John's Fav"} }
    }).toMatchMadeHttpRequest();
  });

  it('test_22', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 632910392, "title": "New product title", "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>", "vendor": "Apple", "product_type": "Cult Products", "created_at": "2025-04-02T11:29:59-05:00", "handle": "ipod-nano", "updated_at": "2025-04-02T11:35:46-05:00", "published_at": "2007-12-31T19:00:00-05:00", "template_suffix": null, "published_scope": "web", "tags": "Emotive, Flash Memory, MP3, Music", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/632910392", "variants": [{"id": 808950810, "product_id": 632910392, "title": "Pink", "price": "199.00", "position": 1, "inventory_policy": "continue", "compare_at_price": null, "option1": "Pink", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_pink", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008PINK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 808950810, "inventory_quantity": 10, "old_inventory_quantity": 10, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/808950810", "image_id": 562641783}, {"id": 49148385, "product_id": 632910392, "title": "Red", "price": "199.00", "position": 2, "inventory_policy": "continue", "compare_at_price": null, "option1": "Red", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_red", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008RED", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 49148385, "inventory_quantity": 20, "old_inventory_quantity": 20, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/49148385", "image_id": null}, {"id": 39072856, "product_id": 632910392, "title": "Green", "price": "199.00", "position": 3, "inventory_policy": "continue", "compare_at_price": null, "option1": "Green", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_green", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008GREEN", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 39072856, "inventory_quantity": 30, "old_inventory_quantity": 30, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/39072856", "image_id": null}, {"id": 457924702, "product_id": 632910392, "title": "Black", "price": "199.00", "position": 4, "inventory_policy": "continue", "compare_at_price": null, "option1": "Black", "option2": null, "option3": null, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "taxable": true, "barcode": "1234_black", "fulfillment_service": "manual", "grams": 567, "inventory_management": "shopify", "requires_shipping": true, "sku": "IPOD2008BLACK", "weight": 1.25, "weight_unit": "lb", "inventory_item_id": 457924702, "inventory_quantity": 40, "old_inventory_quantity": 40, "presentment_prices": [{"price": {"amount": "199.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/457924702", "image_id": null}], "options": [{"id": 594680422, "product_id": 632910392, "name": "Color", "position": 1, "values": ["Pink", "Red", "Green", "Black"]}], "images": [{"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}, {"id": 562641783, "alt": null, "position": 2, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1071517486", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano-2.png?v=1735835399", "variant_ids": [808950810]}, {"id": 378407906, "alt": null, "position": 3, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/220090436", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}], "image": {"id": 850703190, "alt": null, "position": 1, "product_id": 632910392, "created_at": "2025-04-02T11:29:59-05:00", "updated_at": "2025-04-02T11:29:59-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/498048120", "width": 123, "height": 456, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/products/ipod-nano.png?v=1735835399", "variant_ids": []}}}));

    const product = new shopify.rest.Product({session: session});
    product.id = 632910392;
    product.title = "New product title";
    await product.save({});

    expect({
      method: 'PUT',
      domain,
      path: '/admin/api/2025-07/products/632910392.json',
      query: '',
      headers,
      data: { "product": {"title": "New product title"} }
    }).toMatchMadeHttpRequest();
  });

  it('test_23', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({}));

    await shopify.rest.Product.delete({
      session: session,
      id: 632910392,
    });

    expect({
      method: 'DELETE',
      domain,
      path: '/admin/api/2025-07/products/632910392.json',
      query: '',
      headers,
      data: undefined
    }).toMatchMadeHttpRequest();
  });

  it('test_24', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 1072481050, "title": "Burton Custom Freestyle 151", "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "created_at": "2025-04-02T11:36:28-05:00", "handle": "burton-custom-freestyle-151", "updated_at": "2025-04-02T11:36:28-05:00", "published_at": null, "template_suffix": null, "published_scope": "web", "tags": "", "status": "draft", "admin_graphql_api_id": "gid://shopify/Product/1072481050", "variants": [{"id": 1070325028, "product_id": 1072481050, "title": "Default Title", "price": "0.00", "position": 1, "inventory_policy": "deny", "compare_at_price": null, "option1": "Default Title", "option2": null, "option3": null, "created_at": "2025-04-02T11:36:28-05:00", "updated_at": "2025-04-02T11:36:28-05:00", "taxable": true, "barcode": null, "fulfillment_service": "manual", "grams": 0, "inventory_management": null, "requires_shipping": true, "sku": "", "weight": 0.0, "weight_unit": "lb", "inventory_item_id": 1070325028, "inventory_quantity": 0, "old_inventory_quantity": 0, "presentment_prices": [{"price": {"amount": "0.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/1070325028", "image_id": null}], "options": [{"id": 1064576492, "product_id": 1072481050, "name": "Title", "position": 1, "values": ["Default Title"]}], "images": [], "image": null}}));

    const product = new shopify.rest.Product({session: session});
    product.title = "Burton Custom Freestyle 151";
    product.body_html = "<strong>Good snowboard!</strong>";
    product.vendor = "Burton";
    product.product_type = "Snowboard";
    product.status = "draft";
    await product.save({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-07/products.json',
      query: '',
      headers,
      data: { "product": {"title": "Burton Custom Freestyle 151", "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "status": "draft"} }
    }).toMatchMadeHttpRequest();
  });

  it('test_25', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 1072481048, "title": "Burton Custom Freestyle 151", "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "created_at": "2025-04-02T11:36:27-05:00", "handle": "burton-custom-freestyle-151", "updated_at": "2025-04-02T11:36:27-05:00", "published_at": "2025-04-02T11:36:27-05:00", "template_suffix": null, "published_scope": "global", "tags": "", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/1072481048", "variants": [{"id": 1070325025, "product_id": 1072481048, "title": "First", "price": "10.00", "position": 1, "inventory_policy": "deny", "compare_at_price": null, "option1": "First", "option2": null, "option3": null, "created_at": "2025-04-02T11:36:27-05:00", "updated_at": "2025-04-02T11:36:27-05:00", "taxable": true, "barcode": null, "fulfillment_service": "manual", "grams": 0, "inventory_management": null, "requires_shipping": true, "sku": "123", "weight": 0.0, "weight_unit": "lb", "inventory_item_id": 1070325025, "inventory_quantity": 0, "old_inventory_quantity": 0, "presentment_prices": [{"price": {"amount": "10.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/1070325025", "image_id": null}, {"id": 1070325026, "product_id": 1072481048, "title": "Second", "price": "20.00", "position": 2, "inventory_policy": "deny", "compare_at_price": null, "option1": "Second", "option2": null, "option3": null, "created_at": "2025-04-02T11:36:27-05:00", "updated_at": "2025-04-02T11:36:27-05:00", "taxable": true, "barcode": null, "fulfillment_service": "manual", "grams": 0, "inventory_management": null, "requires_shipping": true, "sku": "123", "weight": 0.0, "weight_unit": "lb", "inventory_item_id": 1070325026, "inventory_quantity": 0, "old_inventory_quantity": 0, "presentment_prices": [{"price": {"amount": "20.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/1070325026", "image_id": null}], "options": [{"id": 1064576490, "product_id": 1072481048, "name": "Title", "position": 1, "values": ["First", "Second"]}], "images": [], "image": null}}));

    const product = new shopify.rest.Product({session: session});
    product.title = "Burton Custom Freestyle 151";
    product.body_html = "<strong>Good snowboard!</strong>";
    product.vendor = "Burton";
    product.product_type = "Snowboard";
    product.variants = [
      {
        "option1": "First",
        "price": "10.00",
        "sku": "123"
      },
      {
        "option1": "Second",
        "price": "20.00",
        "sku": "123"
      }
    ];
    await product.save({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-07/products.json',
      query: '',
      headers,
      data: { "product": {"title": "Burton Custom Freestyle 151", "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "variants": [{"option1": "First", "price": "10.00", "sku": "123"}, {"option1": "Second", "price": "20.00", "sku": "123"}]} }
    }).toMatchMadeHttpRequest();
  });

  it('test_26', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 1072481053, "title": "Burton Custom Freestyle 151", "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "created_at": "2025-04-02T11:36:39-05:00", "handle": "burton-custom-freestyle-151", "updated_at": "2025-04-02T11:36:39-05:00", "published_at": "2025-04-02T11:36:39-05:00", "template_suffix": null, "published_scope": "global", "tags": "", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/1072481053", "variants": [{"id": 1070325032, "product_id": 1072481053, "title": "Blue / 155", "price": "0.00", "position": 1, "inventory_policy": "deny", "compare_at_price": null, "option1": "Blue", "option2": "155", "option3": null, "created_at": "2025-04-02T11:36:39-05:00", "updated_at": "2025-04-02T11:36:39-05:00", "taxable": true, "barcode": null, "fulfillment_service": "manual", "grams": 0, "inventory_management": null, "requires_shipping": true, "sku": null, "weight": 0.0, "weight_unit": "lb", "inventory_item_id": 1070325032, "inventory_quantity": 0, "old_inventory_quantity": 0, "presentment_prices": [{"price": {"amount": "0.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/1070325032", "image_id": null}, {"id": 1070325033, "product_id": 1072481053, "title": "Black / 159", "price": "0.00", "position": 2, "inventory_policy": "deny", "compare_at_price": null, "option1": "Black", "option2": "159", "option3": null, "created_at": "2025-04-02T11:36:39-05:00", "updated_at": "2025-04-02T11:36:39-05:00", "taxable": true, "barcode": null, "fulfillment_service": "manual", "grams": 0, "inventory_management": null, "requires_shipping": true, "sku": null, "weight": 0.0, "weight_unit": "lb", "inventory_item_id": 1070325033, "inventory_quantity": 0, "old_inventory_quantity": 0, "presentment_prices": [{"price": {"amount": "0.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/1070325033", "image_id": null}], "options": [{"id": 1064576499, "product_id": 1072481053, "name": "Color", "position": 1, "values": ["Blue", "Black"]}, {"id": 1064576500, "product_id": 1072481053, "name": "Size", "position": 2, "values": ["155", "159"]}], "images": [], "image": null}}));

    const product = new shopify.rest.Product({session: session});
    product.title = "Burton Custom Freestyle 151";
    product.body_html = "<strong>Good snowboard!</strong>";
    product.vendor = "Burton";
    product.product_type = "Snowboard";
    product.variants = [
      {
        "option1": "Blue",
        "option2": "155"
      },
      {
        "option1": "Black",
        "option2": "159"
      }
    ];
    product.options = [
      {
        "name": "Color",
        "values": [
          "Blue",
          "Black"
        ]
      },
      {
        "name": "Size",
        "values": [
          "155",
          "159"
        ]
      }
    ];
    await product.save({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-07/products.json',
      query: '',
      headers,
      data: { "product": {"title": "Burton Custom Freestyle 151", "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "variants": [{"option1": "Blue", "option2": "155"}, {"option1": "Black", "option2": "159"}], "options": [{"name": "Color", "values": ["Blue", "Black"]}, {"name": "Size", "values": ["155", "159"]}]} }
    }).toMatchMadeHttpRequest();
  });

  it('test_27', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 1072481055, "title": "Burton Custom Freestyle 151", "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "created_at": "2025-04-02T11:36:46-05:00", "handle": "burton-custom-freestyle-151", "updated_at": "2025-04-02T11:36:46-05:00", "published_at": "2025-04-02T11:36:46-05:00", "template_suffix": null, "published_scope": "global", "tags": "Barnes & Noble, Big Air, John's Fav", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/1072481055", "variants": [{"id": 1070325035, "product_id": 1072481055, "title": "Default Title", "price": "0.00", "position": 1, "inventory_policy": "deny", "compare_at_price": null, "option1": "Default Title", "option2": null, "option3": null, "created_at": "2025-04-02T11:36:46-05:00", "updated_at": "2025-04-02T11:36:46-05:00", "taxable": true, "barcode": null, "fulfillment_service": "manual", "grams": 0, "inventory_management": null, "requires_shipping": true, "sku": "", "weight": 0.0, "weight_unit": "lb", "inventory_item_id": 1070325035, "inventory_quantity": 0, "old_inventory_quantity": 0, "presentment_prices": [{"price": {"amount": "0.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/1070325035", "image_id": null}], "options": [{"id": 1064576504, "product_id": 1072481055, "name": "Title", "position": 1, "values": ["Default Title"]}], "images": [], "image": null}}));

    const product = new shopify.rest.Product({session: session});
    product.title = "Burton Custom Freestyle 151";
    product.body_html = "<strong>Good snowboard!</strong>";
    product.vendor = "Burton";
    product.product_type = "Snowboard";
    product.tags = [
      "Barnes & Noble",
      "Big Air",
      "John's Fav"
    ];
    await product.save({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-07/products.json',
      query: '',
      headers,
      data: { "product": {"title": "Burton Custom Freestyle 151", "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "tags": ["Barnes & Noble", "Big Air", "John's Fav"]} }
    }).toMatchMadeHttpRequest();
  });

  it('test_28', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 1072481042, "title": "Burton Custom Freestyle 151", "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "created_at": "2025-04-02T11:35:54-05:00", "handle": "burton-custom-freestyle-151", "updated_at": "2025-04-02T11:35:54-05:00", "published_at": "2025-04-02T11:35:54-05:00", "template_suffix": null, "published_scope": "global", "tags": "", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/1072481042", "variants": [{"id": 1070325019, "product_id": 1072481042, "title": "Default Title", "price": "0.00", "position": 1, "inventory_policy": "deny", "compare_at_price": null, "option1": "Default Title", "option2": null, "option3": null, "created_at": "2025-04-02T11:35:54-05:00", "updated_at": "2025-04-02T11:35:54-05:00", "taxable": true, "barcode": null, "fulfillment_service": "manual", "grams": 0, "inventory_management": null, "requires_shipping": true, "sku": "", "weight": 0.0, "weight_unit": "lb", "inventory_item_id": 1070325019, "inventory_quantity": 0, "old_inventory_quantity": 0, "presentment_prices": [{"price": {"amount": "0.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/1070325019", "image_id": null}], "options": [{"id": 1064576483, "product_id": 1072481042, "name": "Title", "position": 1, "values": ["Default Title"]}], "images": [{"id": 1001473907, "alt": null, "position": 1, "product_id": 1072481042, "created_at": "2025-04-02T11:35:54-05:00", "updated_at": "2025-04-02T11:35:54-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1072273204", "width": 110, "height": 140, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/files/rails_logo20250102-63224-bpqtol.gif?v=1735835754", "variant_ids": []}], "image": {"id": 1001473907, "alt": null, "position": 1, "product_id": 1072481042, "created_at": "2025-04-02T11:35:54-05:00", "updated_at": "2025-04-02T11:35:54-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1072273204", "width": 110, "height": 140, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/files/rails_logo20250102-63224-bpqtol.gif?v=1735835754", "variant_ids": []}}}));

    const product = new shopify.rest.Product({session: session});
    product.title = "Burton Custom Freestyle 151";
    product.body_html = "<strong>Good snowboard!</strong>";
    product.vendor = "Burton";
    product.product_type = "Snowboard";
    product.images = [
      {
        "src": "http://example.com/rails_logo.gif"
      }
    ];
    await product.save({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-07/products.json',
      query: '',
      headers,
      data: { "product": {"title": "Burton Custom Freestyle 151", "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "images": [{"src": "http://example.com/rails_logo.gif"}]} }
    }).toMatchMadeHttpRequest();
  });

  it('test_29', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 1072481047, "title": "Burton Custom Freestyle 151", "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "created_at": "2025-04-02T11:36:25-05:00", "handle": "burton-custom-freestyle-151", "updated_at": "2025-04-02T11:36:25-05:00", "published_at": "2025-04-02T11:36:25-05:00", "template_suffix": null, "published_scope": "global", "tags": "", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/1072481047", "variants": [{"id": 1070325024, "product_id": 1072481047, "title": "Default Title", "price": "0.00", "position": 1, "inventory_policy": "deny", "compare_at_price": null, "option1": "Default Title", "option2": null, "option3": null, "created_at": "2025-04-02T11:36:25-05:00", "updated_at": "2025-04-02T11:36:25-05:00", "taxable": true, "barcode": null, "fulfillment_service": "manual", "grams": 0, "inventory_management": null, "requires_shipping": true, "sku": "", "weight": 0.0, "weight_unit": "lb", "inventory_item_id": 1070325024, "inventory_quantity": 0, "old_inventory_quantity": 0, "presentment_prices": [{"price": {"amount": "0.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/1070325024", "image_id": null}], "options": [{"id": 1064576489, "product_id": 1072481047, "name": "Title", "position": 1, "values": ["Default Title"]}], "images": [{"id": 1001473909, "alt": null, "position": 1, "product_id": 1072481047, "created_at": "2025-04-02T11:36:25-05:00", "updated_at": "2025-04-02T11:36:25-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1072273206", "width": 1, "height": 1, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/files/df3e567d6f16d040326c7a0ea29a4f41.gif?v=1735835785", "variant_ids": []}], "image": {"id": 1001473909, "alt": null, "position": 1, "product_id": 1072481047, "created_at": "2025-04-02T11:36:25-05:00", "updated_at": "2025-04-02T11:36:25-05:00", "admin_graphql_api_id": "gid://shopify/MediaImage/1072273206", "width": 1, "height": 1, "src": "https://cdn.shopify.com/s/files/1/0005/4838/0009/files/df3e567d6f16d040326c7a0ea29a4f41.gif?v=1735835785", "variant_ids": []}}}));

    const product = new shopify.rest.Product({session: session});
    product.title = "Burton Custom Freestyle 151";
    product.body_html = "<strong>Good snowboard!</strong>";
    product.vendor = "Burton";
    product.product_type = "Snowboard";
    product.images = [
      {
        "attachment": "R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==\n"
      }
    ];
    await product.save({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-07/products.json',
      query: '',
      headers,
      data: { "product": {"title": "Burton Custom Freestyle 151", "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "images": [{"attachment": "R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==\n"}]} }
    }).toMatchMadeHttpRequest();
  });

  it('test_30', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 1072481045, "title": "Burton Custom Freestyle 151", "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "created_at": "2025-04-02T11:36:11-05:00", "handle": "burton-custom-freestyle-151", "updated_at": "2025-04-02T11:36:12-05:00", "published_at": null, "template_suffix": null, "published_scope": "global", "tags": "", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/1072481045", "variants": [{"id": 1070325021, "product_id": 1072481045, "title": "Default Title", "price": "0.00", "position": 1, "inventory_policy": "deny", "compare_at_price": null, "option1": "Default Title", "option2": null, "option3": null, "created_at": "2025-04-02T11:36:12-05:00", "updated_at": "2025-04-02T11:36:12-05:00", "taxable": true, "barcode": null, "fulfillment_service": "manual", "grams": 0, "inventory_management": null, "requires_shipping": true, "sku": "", "weight": 0.0, "weight_unit": "lb", "inventory_item_id": 1070325021, "inventory_quantity": 0, "old_inventory_quantity": 0, "presentment_prices": [{"price": {"amount": "0.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/1070325021", "image_id": null}], "options": [{"id": 1064576487, "product_id": 1072481045, "name": "Title", "position": 1, "values": ["Default Title"]}], "images": [], "image": null}}));

    const product = new shopify.rest.Product({session: session});
    product.title = "Burton Custom Freestyle 151";
    product.body_html = "<strong>Good snowboard!</strong>";
    product.vendor = "Burton";
    product.product_type = "Snowboard";
    product.published = false;
    await product.save({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-07/products.json',
      query: '',
      headers,
      data: { "product": {"title": "Burton Custom Freestyle 151", "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "published": false} }
    }).toMatchMadeHttpRequest();
  });

  it('test_31', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 1072481049, "title": "Burton Custom Freestyle 151", "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "created_at": "2025-04-02T11:36:27-05:00", "handle": "burton-custom-freestyle-151", "updated_at": "2025-04-02T11:36:27-05:00", "published_at": "2025-04-02T11:36:27-05:00", "template_suffix": null, "published_scope": "global", "tags": "", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/1072481049", "variants": [{"id": 1070325027, "product_id": 1072481049, "title": "Default Title", "price": "0.00", "position": 1, "inventory_policy": "deny", "compare_at_price": null, "option1": "Default Title", "option2": null, "option3": null, "created_at": "2025-04-02T11:36:27-05:00", "updated_at": "2025-04-02T11:36:27-05:00", "taxable": true, "barcode": null, "fulfillment_service": "manual", "grams": 0, "inventory_management": null, "requires_shipping": true, "sku": "", "weight": 0.0, "weight_unit": "lb", "inventory_item_id": 1070325027, "inventory_quantity": 0, "old_inventory_quantity": 0, "presentment_prices": [{"price": {"amount": "0.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/1070325027", "image_id": null}], "options": [{"id": 1064576491, "product_id": 1072481049, "name": "Title", "position": 1, "values": ["Default Title"]}], "images": [], "image": null}}));

    const product = new shopify.rest.Product({session: session});
    product.title = "Burton Custom Freestyle 151";
    product.body_html = "<strong>Good snowboard!</strong>";
    product.vendor = "Burton";
    product.product_type = "Snowboard";
    product.metafields = [
      {
        "key": "new",
        "value": "newvalue",
        "type": "single_line_text_field",
        "namespace": "global"
      }
    ];
    await product.save({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-07/products.json',
      query: '',
      headers,
      data: { "product": {"title": "Burton Custom Freestyle 151", "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "metafields": [{"key": "new", "value": "newvalue", "type": "single_line_text_field", "namespace": "global"}]} }
    }).toMatchMadeHttpRequest();
  });

  it('test_32', async () => {
    const shopify = shopifyApi(
      testConfig({apiVersion: ApiVersion.July25, restResources}),
    );

    queueMockResponse(JSON.stringify({"product": {"id": 1072481058, "title": "Burton Custom Freestyle 151", "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "created_at": "2025-04-02T11:36:51-05:00", "handle": "burton-custom-freestyle-151", "updated_at": "2025-04-02T11:36:51-05:00", "published_at": "2025-04-02T11:36:51-05:00", "template_suffix": null, "published_scope": "global", "tags": "", "status": "active", "admin_graphql_api_id": "gid://shopify/Product/1072481058", "variants": [{"id": 1070325038, "product_id": 1072481058, "title": "Default Title", "price": "0.00", "position": 1, "inventory_policy": "deny", "compare_at_price": null, "option1": "Default Title", "option2": null, "option3": null, "created_at": "2025-04-02T11:36:51-05:00", "updated_at": "2025-04-02T11:36:51-05:00", "taxable": true, "barcode": null, "fulfillment_service": "manual", "grams": 0, "inventory_management": null, "requires_shipping": true, "sku": "", "weight": 0.0, "weight_unit": "lb", "inventory_item_id": 1070325038, "inventory_quantity": 0, "old_inventory_quantity": 0, "presentment_prices": [{"price": {"amount": "0.00", "currency_code": "USD"}, "compare_at_price": null}], "admin_graphql_api_id": "gid://shopify/ProductVariant/1070325038", "image_id": null}], "options": [{"id": 1064576509, "product_id": 1072481058, "name": "Title", "position": 1, "values": ["Default Title"]}], "images": [], "image": null}}));

    const product = new shopify.rest.Product({session: session});
    product.title = "Burton Custom Freestyle 151";
    product.body_html = "<strong>Good snowboard!</strong>";
    product.vendor = "Burton";
    product.product_type = "Snowboard";
    product.metafields_global_title_tag = "Product SEO Title";
    product.metafields_global_description_tag = "Product SEO Description";
    await product.save({});

    expect({
      method: 'POST',
      domain,
      path: '/admin/api/2025-07/products.json',
      query: '',
      headers,
      data: { "product": {"title": "Burton Custom Freestyle 151", "body_html": "<strong>Good snowboard!</strong>", "vendor": "Burton", "product_type": "Snowboard", "metafields_global_title_tag": "Product SEO Title", "metafields_global_description_tag": "Product SEO Description"} }
    }).toMatchMadeHttpRequest();
  });

});
