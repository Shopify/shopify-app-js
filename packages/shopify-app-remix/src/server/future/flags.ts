// When adding new flags, you should also add them to the `TEST_FUTURE_FLAGS` object in `test-config.ts` to ensure that

import type {ConfigParams, ShopifyRestResources} from '@shopify/shopify-api';

// it doesn't cause regressions.
export interface FutureFlags {
  /**
   * When enabled, returns the same `admin` context (`AdminApiContext`) from `authenticate.webhook` that is returned from `authenticate.admin`.
   *
   * @default false
   */
  v3_webhookAdminContext?: boolean;

  /**
   * When enabled authenticate.public() will not work.  Use authenticate.public.checkout() instead.
   *
   * @default false
   */
  v3_authenticatePublic?: boolean;

  /**
   * When enabled allows you to pass billing plans with line items when creating a new app subscriptions.
   */
  v3_lineItemBilling?: boolean;

  /**
   * When enabled, embedded apps will fetch access tokens via [token exchange](https://shopify.dev/docs/apps/auth/get-access-tokens/token-exchange).
   * This assumes the app has scopes declared for [Shopify managing installation](https://shopify.dev/docs/apps/auth/installation#shopify-managed-installation).
   *
   * Learn more about this [new embedded app auth strategy](https://shopify.dev/docs/api/shopify-app-remix#embedded-auth-strategy).
   *
   * @default false
   */
  unstable_newEmbeddedAuthStrategy?: boolean;
}

// When adding new flags, use this format:
// vX_myFutureFlag: Future extends FutureFlags ? Future['vX_myFutureFlag'] : false;
export interface ApiFutureFlags<Future extends FutureFlagOptions> {
  v10_lineItemBilling: Future extends FutureFlags
    ? Future['v3_lineItemBilling']
    : false;
}

export type ApiConfigWithFutureFlags<Future extends FutureFlagOptions> =
  ConfigParams<ShopifyRestResources, ApiFutureFlags<Future>>;

export type FutureFlagOptions = FutureFlags | undefined;

export type FeatureEnabled<
  Future extends FutureFlagOptions,
  Flag extends keyof FutureFlags,
> = Future extends FutureFlags
  ? Future[Flag] extends true
    ? true
    : false
  : false;
