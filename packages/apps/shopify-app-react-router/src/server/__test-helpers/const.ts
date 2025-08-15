import {ApiVersion} from '@shopify/shopify-api';
import {TEST_SHOP} from '@shopify/shopify-api/test-helpers';

export {
  API_KEY,
  API_SECRET_KEY,
  APP_URL,
  TEST_SHOP_NAME,
  TEST_SHOP,
  SHOPIFY_HOST,
  BASE64_HOST,
  USER_ID,
} from '@shopify/shopify-api/test-helpers';

// Test API version constant - update this when testing against a different API version
export const TEST_API_VERSION = ApiVersion.July25;

export const GRAPHQL_URL = `https://${TEST_SHOP}/admin/api/${TEST_API_VERSION}/graphql.json`;
