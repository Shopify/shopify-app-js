export const APP_BRIDGE_URL = '/dev/app-bridge.js';

export const REAUTH_URL_HEADER =
  'X-Shopify-API-Request-Failure-Reauthorize-Url';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization',
  'Access-Control-Expose-Headers': REAUTH_URL_HEADER,
};
