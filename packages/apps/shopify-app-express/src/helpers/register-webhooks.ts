import {privacyTopics, Session, Shopify} from '@shopify/shopify-api';

import {AppConfigInterface} from '../config-types';

export async function registerWebhooks(
  config: AppConfigInterface,
  api: Shopify,
  session: Session,
): Promise<void> {
  config.logger.debug('Registering webhooks', {shop: session.shop});

  const responsesByTopic = await api.webhooks.register({session});

  for (const topic in responsesByTopic) {
    if (!Object.prototype.hasOwnProperty.call(responsesByTopic, topic)) {
      continue;
    }

    for (const response of responsesByTopic[topic]) {
      if (!response.success && !privacyTopics.includes(topic)) {
        const result: any = response.result;

        if (result.errors) {
          config.logger.error(
            `Failed to register ${topic} webhook: ${result.errors[0].message}`,
            {shop: session.shop},
          );
        } else {
          config.logger.error(
            `Failed to register ${topic} webhook: ${JSON.stringify(
              result.data,
            )}`,
            {shop: session.shop},
          );
        }
      }
    }
  }
}
