// This file contains types we want to export to make it easier for apps to pass the contexts we return as types

import type {AppConfigArg} from './config-types';
import type {ShopifyApp} from './types';
import type {AdminContext as IAdminContext} from './authenticate/admin/types';
import type {WebhookContext as IWebhookContext} from './authenticate/webhooks/types';
import type {
  AppProxyContext as IAppProxyContext,
  AppProxyContextWithSession as IAppProxyContextWithSession,
} from './authenticate/public/appProxy/types';
import type {
  AdminApiContext as IAdminApiContext,
  StorefrontContext as IStorefrontContext,
} from './clients';

// Direct re-exports for types without transformations
export type {UnauthenticatedAdminContext} from './unauthenticated/admin/types';
export type {UnauthenticatedStorefrontContext} from './unauthenticated/storefront/types';
export type {FlowContext} from './authenticate/flow/types';
export type {FulfillmentServiceContext} from './authenticate/fulfillment-service/types';
export type {ScopesDetail} from './authenticate/admin/scope/types';
export type {AdminApiContext} from './clients';
export type {ScopesContext} from './authenticate/admin/types';
export type {CheckoutContext} from './authenticate/public/checkout/types';
export type {CustomerAccountContext} from './authenticate/public/customer-account/types';
export type {StorefrontContext as StorefrontApiContext} from './clients';
export type {POSContext} from './authenticate/pos/types';

type ShopifyConfig<App> =
  App extends ShopifyApp<infer Config extends AppConfigArg> ? Config : never;

type DefaultApp = ShopifyApp<AppConfigArg>;

// Types that need transformations or generic parameters
export type AdminContext<App = DefaultApp> = IAdminContext<ShopifyConfig<App>>;

// Types that need modifications
export type AppProxyContext = IAppProxyContext | IAppProxyContextWithSession;

export type WebhookContext = IWebhookContext<string>;

// Extra types for API contexts
export type AdminGraphqlClient = IAdminApiContext['graphql'];

export type StorefrontGraphqlClient = IStorefrontContext['graphql'];
