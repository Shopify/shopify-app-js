export const DEFAULT_CONTENT_TYPE = 'application/json';
export const DEFAULT_SDK_VARIANT = 'storefront-api-client';
// This is value is replaced with package.json version during rolldown build process
declare const ROLLDOWN_REPLACE_CLIENT_VERSION: string | undefined;
export const DEFAULT_CLIENT_VERSION =
  typeof ROLLDOWN_REPLACE_CLIENT_VERSION === 'undefined'
    ? 'test-version'
    : ROLLDOWN_REPLACE_CLIENT_VERSION;

export const PUBLIC_ACCESS_TOKEN_HEADER = 'X-Shopify-Storefront-Access-Token';
export const PRIVATE_ACCESS_TOKEN_HEADER = 'Shopify-Storefront-Private-Token';
export const SDK_VARIANT_HEADER = 'X-SDK-Variant';
export const SDK_VERSION_HEADER = 'X-SDK-Version';
export const SDK_VARIANT_SOURCE_HEADER = 'X-SDK-Variant-Source';

export const CLIENT = 'Storefront API Client';
