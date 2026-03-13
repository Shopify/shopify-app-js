import {Shopify} from '@shopify/shopify-api';

export interface FutureFlags {
  /**
   * When enabled, embedded apps will fetch access tokens via token exchange
   * instead of the OAuth redirect flow. Requires Shopify managed installation.
   * @default false
   */
  unstable_newEmbeddedAuthStrategy?: boolean;

  /**
   * When enabled, the app will use expiring offline access tokens and
   * automatically refresh them when they are close to expiring.
   * @default false
   */
  expiringOfflineAccessTokens?: boolean;
}

export type FutureFlagOptions = FutureFlags | undefined;

export type FeatureEnabled<
  Future extends FutureFlagOptions,
  Flag extends keyof FutureFlags,
> = Future extends FutureFlags
  ? Future[Flag] extends true
    ? true
    : false
  : false;

// Logs a startup hint when unstable_newEmbeddedAuthStrategy is disabled.
export function logDisabledFutureFlags(
  config: {future: FutureFlags},
  logger: Shopify['logger'],
): void {
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
