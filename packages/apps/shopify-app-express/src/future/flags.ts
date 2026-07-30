import {Shopify} from '@shopify/shopify-api';

import {AppConfigInterface} from '../config-types';

/**
 * Logs a startup hint for each future flag that is currently disabled, so
 * developers can discover opt-in features.
 */
export function logDisabledFutureFlags(
  config: AppConfigInterface,
  logger: Shopify['logger'],
): void {
  const logFlag = (flag: string, message: string) =>
    logger.info(`Future flag ${flag} is disabled.\n\n  ${message}\n`);

  if (!config.future?.unstable_tokenExchange) {
    logFlag(
      'unstable_tokenExchange',
      'Enable this to use OAuth token exchange instead of the auth code flow for embedded apps. ' +
        'Your app must use Shopify managed installation: https://shopify.dev/docs/apps/auth/installation',
    );
  }

  if (!config.future?.expiringOfflineAccessTokens) {
    logFlag(
      'expiringOfflineAccessTokens',
      'Enable this to use expiring offline access tokens and automatically refresh them before they expire.',
    );
  }
}
