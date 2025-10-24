import '@shopify/shopify-api/adapters/web-api';
import {setAbstractRuntimeString} from '@shopify/shopify-api/runtime';

setAbstractRuntimeString(() => {
  return `React Router`;
});

export {
  LogSeverity,
  DeliveryMethod,
  BillingInterval,
  BillingReplacementBehavior,
  ApiVersion,
  Session,
} from '@shopify/shopify-api';

export type {JwtPayload} from '@shopify/shopify-api';

export type * from './types-contexts';
export type {ShopifyApp, LoginError} from './types';
export {LoginErrorType, AppDistribution} from './types';
export {boundary} from './boundary';
export {shopifyApp} from './shopify-app';
export * from './errors';

// Export middleware contexts
export {
  adminContext,
  sessionContext,
  sessionTokenContext,
  webhookContext,
  flowContext,
} from './middleware/contexts';

// Export middleware types
export type {
  AdminContext,
  EmbeddedAdminContext,
  NonEmbeddedAdminContext,
  AuthMiddlewareOptions,
  BillingRequiredOptions,
  WebhookContext,
  FlowContext,
  GetAdminContext,
} from './middleware/types';
