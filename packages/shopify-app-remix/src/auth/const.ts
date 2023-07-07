export const APP_BRIDGE_NEXT_URL =
  'https://cdn.shopify.com/shopifycloud/app-bridge-next.js';

export const REAUTH_URL_HEADER =
  'X-Shopify-API-Request-Failure-Reauthorize-Url';

export const APP_BRIDGE_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization',
  'Access-Control-Expose-Headers': REAUTH_URL_HEADER,
};

export const DEFAULT_CSP_VALUE = `frame-ancestors https://*.myshopify.com https://admin.shopify.com;`;
