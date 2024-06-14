import {LATEST_API_VERSION} from '@shopify/shopify-api';

export const API_SECRET_KEY = 'testApiSecretKey';
export const API_KEY = 'testApiKey';
export const APP_URL = 'https://my-test-app.myshopify.io';
export const SHOPIFY_HOST = 'totally-real-host.myshopify.io';
export const BASE64_HOST = Buffer.from(SHOPIFY_HOST).toString('base64');
export const TEST_SHOP_NAME = 'test-shop';
export const TEST_SHOP = `${TEST_SHOP_NAME}.myshopify.com`;
export const GRAPHQL_URL = `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/graphql.json`;
export const USER_ID = 12345;
