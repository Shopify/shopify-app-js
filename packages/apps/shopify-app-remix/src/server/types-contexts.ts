// This file contains types we want to export to make it easier for apps to pass the contexts we return as types

import type {AppConfigArg} from './config-types';
import type {ShopifyApp} from './types';
import type {
  AdminContext as IAdminContext,
  ScopesContext as IScopesContext,
} from './authenticate/admin/types';
import type {ScopesDetail as IScopesDetail} from './authenticate/admin/scope/types';
import type {UnauthenticatedAdminContext as IUnauthenticatedAdminContext} from './unauthenticated/admin/types';
import type {UnauthenticatedStorefrontContext as IUnauthenticatedStorefrontContext} from './unauthenticated/storefront/types';
import type {WebhookContext as IWebhookContext} from './authenticate/webhooks/types';
import type {FlowContext as IFlowContext} from './authenticate/flow/types';
import type {FulfillmentServiceContext as IFulfillmentServiceContext} from './authenticate/fulfillment-service/types';
import type {
  AppProxyContext as IAppProxyContext,
  AppProxyContextWithSession as IAppProxyContextWithSession,
} from './authenticate/public/appProxy/types';
import type {CheckoutContext as ICheckoutContext} from './authenticate/public/checkout/types';
import type {CustomerAccountContext as ICustomerAccountContext} from './authenticate/public/customer-account/types';
import type {
  AdminApiContext as IAdminApiContext,
  StorefrontContext as IStorefrontContext,
} from './clients';

type ShopifyConfig<App> =
  App extends ShopifyApp<infer Config extends AppConfigArg> ? Config : never;

type ConfigComponents<Config> =
  Config extends AppConfigArg<infer Resources, infer Storage, infer Future>
    ? {resources: Resources; storage: Storage; future: Future}
    : never;

type DefaultApp = ShopifyApp<AppConfigArg>;

export type UnauthenticatedAdminContext<App = DefaultApp> =
  IUnauthenticatedAdminContext<
    ConfigComponents<ShopifyConfig<App>>['resources']
  >;

export type AdminContext<App = DefaultApp> = IAdminContext<
  ShopifyConfig<App>,
  ConfigComponents<ShopifyConfig<App>>['resources']
>;

export type ScopesContext<_App = DefaultApp> = IScopesContext;
export type ScopesDetail = IScopesDetail;

export type UnauthenticatedStorefrontContext<_App = DefaultApp> =
  IUnauthenticatedStorefrontContext;

export type FlowContext<App = DefaultApp> = IFlowContext<
  ConfigComponents<ShopifyConfig<App>>['resources']
>;

export type FulfillmentServiceContext<App = DefaultApp> =
  IFulfillmentServiceContext<ConfigComponents<ShopifyConfig<App>>['resources']>;

export type AppProxyContext<_App = DefaultApp> =
  | IAppProxyContext
  | IAppProxyContextWithSession;

export type CheckoutContext<_App = DefaultApp> = ICheckoutContext;

export type CustomerAccountContext<_App = DefaultApp> = ICustomerAccountContext;

export type WebhookContext<App = DefaultApp> = IWebhookContext<
  ConfigComponents<ShopifyConfig<App>>['resources'],
  string
>;

// Extra types for the Admin API context
export type AdminApiContext<App = DefaultApp> = IAdminApiContext<
  ConfigComponents<ShopifyConfig<App>>['resources']
>;

export type AdminRestClient<App = DefaultApp> = AdminApiContext<App>['rest'];

export type AdminGraphqlClient<App = DefaultApp> =
  AdminApiContext<App>['graphql'];

// Extra types for the Storefront API context
export type StorefrontApiContext<_App = DefaultApp> = IStorefrontContext;

export type StorefrontGraphqlClient<App = DefaultApp> =
  StorefrontApiContext<App>['graphql'];
