import {type ShopifyLogger} from '../lib/logger';
import {type ConfigInterface} from '../lib/base-types';

/**
 * Future flags are used to enable features that are not yet available by default.
 */
export interface FutureFlags {
  /**
   * Enable line item billing, to make billing configuration more similar to the GraphQL API. Default enabling of this
   * feature has been moved to v11. Use lineItemBilling instead.
   */
  v10_lineItemBilling?: boolean;

  /**
   * Enable line item billing, to make billing configuration more similar to the GraphQL API.
   */
  lineItemBilling?: boolean;

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

  if (!config.future?.lineItemBilling) {
    logFlag(
      'lineItemBilling',
      'Enable this flag to use the new billing API, that supports multiple line items per plan.',
    );
  }
  if (config.future?.v10_lineItemBilling) {
    logger.deprecated(
      '11.0.0',
      'v10_lineItemBilling will become enabled in v11. Use flag lineItemBilling instead',
    );
  }

  if (!config.future?.customerAddressDefaultFix) {
    logFlag(
      'customerAddressDefaultFix',
      "Enable this flag to change the CustomerAddress classes to expose a 'is_default' property instead of 'default' when fetching data.",
    );
  }
}
