import type {
  ConfigParams,
  Shopify,
  ShopifyRestResources,
} from '@shopify/shopify-api';

import {AppConfig} from '../config-types';

// When adding new flags, you should also add them to the `TEST_FUTURE_FLAGS` object in `test-config.ts` to ensure that
// it doesn't cause regressions.
export interface FutureFlags {
  /**
   * When enabled, methods for interacting with the admin REST API will not be returned.
   *
   * This affects:
   *
   * * `authenticate.admin(request)`
   * * `authenticate.webhook(request)`
   * * `authenticate.flow(request)`
   * * `authenticate.appProxy(request)`
   * * `authenticate.fulfillmentService(request)`
   * * `unauthenticated.admin(shop)`
   *
   * In a future release we will remove REST from the package completely.
   *
   * Please see: [https://www.shopify.com/ca/partners/blog/all-in-on-graphql](https://www.shopify.com/ca/partners/blog/all-in-on-graphql)
   *
   * @default false
   */
  removeRest?: boolean;
}

// When adding new flags, use this format:
// apiFutureFlag: Future extends FutureFlags ? Future['remixFutureFlag'] : false;
export interface ApiFutureFlags<_Future extends FutureFlagOptions> {
  // We're currently hardcoding this flag to true in our settings, so we should propagate it here
  lineItemBilling: true;
  unstable_managedPricingSupport: true;
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

export function logDisabledFutureFlags(
  config: AppConfig,
  logger: Shopify['logger'],
) {
  const logFlag = (flag: string, message: string) =>
    logger.info(`Future flag ${flag} is disabled.\n\n  ${message}\n`);

  if (!config.future.removeRest) {
    logFlag(
      'removeRest',
      'Enable this to remove REST API methods from the package. Shopify is going all-in on GraphQL.' +
        '\n  Learn more at: https://www.shopify.com/ca/partners/blog/all-in-on-graphql',
    );
  }
}
