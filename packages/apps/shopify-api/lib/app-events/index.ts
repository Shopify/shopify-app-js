import {ConfigInterface} from '../base-types';

import {appEventLog} from './log';
import {AppEventLog} from './types';

export interface ShopifyAppEvents {
  /**
   * Sends one App Event to Shopify using the app's client credentials.
   *
   * {@link https://shopify.dev/docs/api/app-events}
   */
  log: AppEventLog;
}

export function shopifyAppEvents(config: ConfigInterface): ShopifyAppEvents {
  return {
    log: appEventLog(config),
  };
}

export * from './types';
