import {ConfigInterface} from '../base-types';

import {addHandlers, getTopicsAdded, getHandlers, registry} from './registry';
import {register} from './register';
import {process} from './process';
import {validateFactory} from './validate';
import {HttpWebhookHandlerWithCallback, WebhookRegistry} from './types';


interface Webhooks {
  /**
   * Add shop-specific webhook handlers to the library registry,
   * allowing you to register webhooks with Shopify and process HTTP webhook requests from Shopify.
   * Unless your app needs different webhooks for different shops, we recommend using app-specific webhooks:
   *
   * {@link https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions}
   *
   * If you use only app-specific webhooks, you do not need to use `addHandlers`.
   *
   */
  addHandlers: ReturnType<typeof addHandlers>;

  /**
   * Fetches the configured handlers for shop-specific webhooks for the given topic.
   *
   * Unless your app needs different webhooks for different shops, we recommend using app-specific webhooks:
   *
   * {@link https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions}
   *
   * If you use only app-specific webhooks, you do not need to use `getTopicsAdded`.
   *
   */
  getTopicsAdded: ReturnType<typeof getTopicsAdded>;

  /**
   * Fetches all topics that were added to the registry.
   *
   * Unless your app needs different webhooks for different shops, we recommend using app-specific webhooks:
   *
   * {@link https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions}
   *
   * If you use only app-specific webhooks, you do not need to use `getHandlers`.
   *
   */
  getHandlers: ReturnType<typeof getHandlers>;

  /**
   * Registers a webhook handler for a given topic.
   *
   * Unless your app needs different webhooks for different shops, we recommend using app-specific webhooks:
   *
   * {@link https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions}
   *
   * If you use only app-specific webhooks, you do not need to use `register`.
   *
   */
  register: ReturnType<typeof register>;

  /**
   * Processes a webhook request.
   *
   * Unless your app needs different webhooks for different shops, we recommend using app-specific webhooks:
   *
   * {@link https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions}
   *
   * If you use only app-specific webhooks, you do not need to use `process`.
   *
   */
  process: ReturnType<typeof process>;

  /**
   * Validates an incoming request for `Http` handlers.
   *
   * If the call is invalid, it will return a `valid` field set to `false`.
   *
   * `validate` can be used to validate all Shopify webhook requests, regardless of if they are app-specific or shop-specific.
   *
   */
  validate: ReturnType<typeof validateFactory>;
}

export function shopifyWebhooks(config: ConfigInterface): Webhooks {
  const webhookRegistry = registry();

  return {
    addHandlers: addHandlers(config, webhookRegistry),
    getTopicsAdded: getTopicsAdded(webhookRegistry),
    getHandlers: getHandlers(webhookRegistry),
    register: register(config, webhookRegistry),
    process: process(
      config,
      webhookRegistry as WebhookRegistry<HttpWebhookHandlerWithCallback>,
    ),
    validate: validateFactory(config),
  };
}

export type ShopifyWebhooks = ReturnType<typeof shopifyWebhooks>;
