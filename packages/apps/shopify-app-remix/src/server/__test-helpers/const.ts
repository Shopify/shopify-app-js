import {LATEST_API_VERSION} from '@shopify/shopify-api';
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
export const GRAPHQL_URL = `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/graphql.json`;
