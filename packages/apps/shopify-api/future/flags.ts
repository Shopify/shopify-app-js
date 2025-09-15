import {type ShopifyLogger} from '../lib/logger';
import {type ConfigInterface} from '../lib/base-types';

/**
 * Future flags are used to enable features that are not yet available by default.
 */
export interface FutureFlags {
  /**
   * Enable support for managed pricing, so apps can check for payments without needing a billing config.
   */
  unstable_managedPricingSupport?: boolean;

  /**
   * Change the CustomerAddress classes to expose a `is_default` property instead of `default` when fetching data. This
   * resolves a conflict with the default() method in that class.
   */
  customerAddressDefaultFix?: boolean;
}

/**
 * Configuration option for future flags.
 */
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
  config: ConfigInterface,
  logger: ShopifyLogger,
) {
  if (!config._logDisabledFutureFlags) {
    return;
  }

  const logFlag = (flag: string, message: string) =>
    logger.info(`Future flag ${flag} is disabled.\n\n  ${message}\n`);

  if (!config.future?.customerAddressDefaultFix) {
    logFlag(
      'customerAddressDefaultFix',
      "Enable this flag to change the CustomerAddress classes to expose a 'is_default' property instead of 'default' when fetching data.",
    );
  }

  if (!config.future?.unstable_managedPricingSupport) {
    logFlag(
      'unstable_managedPricingSupport',
      'Enable this flag to support managed pricing, so apps can check for payments without needing a billing config. Learn more at https://shopify.dev/docs/apps/launch/billing/managed-pricing',
    );
  }
}
