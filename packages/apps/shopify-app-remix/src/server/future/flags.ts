import type {ConfigParams, Shopify} from '@shopify/shopify-api';

import {AppConfig} from '../config-types';

// When adding new flags, you should also add them to the `TEST_FUTURE_FLAGS` object in `test-config.ts` to ensure that
// it doesn't cause regressions.
export interface FutureFlags {
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
// apiFutureFlag: Future extends FutureFlags ? Future['remixFutureFlag'] : false;
export interface ApiFutureFlags<_Future extends FutureFlagOptions> {
  unstable_managedPricingSupport: true;
}

export type ApiConfigWithFutureFlags<Future extends FutureFlagOptions> =
  ConfigParams<ApiFutureFlags<Future>>;

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

  if (!config.future.unstable_newEmbeddedAuthStrategy) {
    logFlag(
      'unstable_newEmbeddedAuthStrategy',
      'Enable this to use OAuth token exchange instead of auth code to generate API access tokens.' +
        '\n  Your app must be using Shopify managed install: https://shopify.dev/docs/apps/auth/installation',
    );
  }
}
