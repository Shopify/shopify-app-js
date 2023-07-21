export const APP_BRIDGE_URL =
  'https://cdn.shopify.com/shopifycloud/app-bridge.js';

export const REAUTH_URL_HEADER =
  'X-Shopify-API-Request-Failure-Reauthorize-Url';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization',
  'Access-Control-Expose-Headers': REAUTH_URL_HEADER,
};
