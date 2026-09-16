import type {AppEventInput, AppEventLogResult} from '@shopify/shopify-api';

/**
 * Sends one App Event to Shopify.
 * @publicDocs
 */
export type LogAppEvent = (event: AppEventInput) => Promise<AppEventLogResult>;

export interface AppEvents {
  /**
   * Sends an App Event to Shopify using the app's client credentials. `shopifyApp` mints a Global API token from `apiKey` and `apiSecretKey`, caches it until shortly before it expires, and mints a new one once if Shopify rejects it with a 401. Pass the shop's `myshopify.com` domain, usually `session.shop`.
   *
   * @example
   * <caption>Logging an event after authenticating the admin.</caption>
   * ```ts
   * import {shopifyApp} from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   * });
   *
   * const {session} = await authenticate.admin(request);
   * await shopify.appEvents.log({
   *   myshopifyDomain: session.shop,
   *   eventHandle: 'onboarding_completed',
   *   idempotencyKey: `onboarding-${session.shop}`,
   *   attributes: {onboarding_version: 3},
   * });
   * ```
   */
  log: LogAppEvent;
}
