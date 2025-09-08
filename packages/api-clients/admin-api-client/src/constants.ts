export const DEFAULT_CONTENT_TYPE = 'application/json';
// This is value is replaced with package.json version during rolldown build process
declare const ROLLDOWN_REPLACE_CLIENT_VERSION: string | undefined;
export const DEFAULT_CLIENT_VERSION =
  typeof ROLLDOWN_REPLACE_CLIENT_VERSION === 'undefined'
    ? 'test-version'
    : ROLLDOWN_REPLACE_CLIENT_VERSION;
export const ACCESS_TOKEN_HEADER = 'X-Shopify-Access-Token';
export const CLIENT = 'Admin API Client';
export const RETRIABLE_STATUS_CODES = [429, 500, 503];
export const DEFAULT_RETRY_WAIT_TIME = 1000;
