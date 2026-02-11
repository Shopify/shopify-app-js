import type {ConfigParams, Shopify} from '@shopify/shopify-api';

import type {AppConfig} from '../config-types';

// When adding new flags, you should also add them to the `TEST_FUTURE_FLAGS` object in `test-config.ts` to ensure that
// it doesn't cause regressions.
export interface FutureFlags {
  /**
   * When enabled, the app will start using expiring offline access tokens and automatically refresh them when they are close to expiring.
   *
   * @default false
   */
  expiringOfflineAccessTokens?: boolean;
}

// When adding new flags, use this format:
// apiFutureFlag: Future extends FutureFlags ? Future['reactRouterFutureFlag'] : false;
export interface ApiFutureFlags<Future extends FutureFlagOptions> {
  expiringOfflineAccessTokens: Future extends FutureFlags
    ? Future['expiringOfflineAccessTokens']
    : false;
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
  _config: AppConfig,
  _logger: Shopify['logger'],
) {
  // When future flags are added to the FutureFlags interface, add logging here
  // Example:
  // const logFlag = (flag: string, message: string) =>
  //   _logger.info(`Future flag ${flag} is disabled.\n\n  ${message}\n`);
  //
  // if (!_config.future.someFutureFlag) {
  //   logFlag('someFutureFlag', 'Description of what this flag enables');
  // }
}
