import {ApiVersion} from '../types';

export const DOMAIN = 'test-shop.myshopify.io';
export const ACCESS_TOKEN = 'access-token';
export const GRAPHQL_BASE_REQUEST = {
  method: 'POST',
  domain: DOMAIN,
  path: `/admin/api/${ApiVersion.July25}/graphql.json`,
  headers: {'X-Shopify-Access-Token': ACCESS_TOKEN},
};
