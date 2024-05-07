import '@shopify/shopify-api/adapters/web-api';
import {setAbstractRuntimeString} from '@shopify/shopify-api/runtime';

setAbstractRuntimeString(() => {
  return `Remix`;
});

export {
  LATEST_API_VERSION,
  LogSeverity,
  DeliveryMethod,
  BillingInterval,
  ApiVersion,
} from '@shopify/shopify-api';

export type {ShopifyApp, LoginError, AdminApiContextFromConfig} from './types';
export type {AdminApiContext} from './clients';
export {LoginErrorType, AppDistribution} from './types';
export {boundary} from './boundary';
export {shopifyApp, appConfig} from './shopify-app';
export * from './errors';
