import {LATEST_API_VERSION} from '../types';

export const DOMAIN = 'test-shop.myshopify.io';
export const ACCESS_TOKEN = 'access-token';
export const GRAPHQL_BASE_REQUEST = {
  method: 'POST',
  domain: DOMAIN,
  path: `/admin/api/${LATEST_API_VERSION}/graphql.json`,
  headers: {'X-Shopify-Access-Token': ACCESS_TOKEN},
};
