export const APP_BRIDGE_URL =
  'https://cdn.shopify.com/shopifycloud/app-bridge.js';

export const REAUTH_URL_HEADER =
  'X-Shopify-API-Request-Failure-Reauthorize-Url';

export const RETRY_INVALID_SESSION_HEADER = {
  'X-Shopify-Retry-Invalid-Session-Request': '1',
};

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization',
  'Access-Control-Expose-Headers': REAUTH_URL_HEADER,
};
