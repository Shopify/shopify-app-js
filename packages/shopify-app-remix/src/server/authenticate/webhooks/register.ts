import type {BasicParams} from '../../types';

import type {RegisterWebhooksOptions} from './types';

export function registerWebhooksFactory({api, logger}: BasicParams) {
  return async function registerWebhooks({session}: RegisterWebhooksOptions) {
    return api.webhooks.register({session}).then((response) => {
      Object.entries(response).forEach(([topic, topicResults]) => {
        topicResults.forEach(({success, ...rest}) => {
          if (success) {
            logger.debug('Registered webhook', {
              topic,
              shop: session.shop,
              operation: rest.operation,
            });
          } else {
            logger.error('Failed to register webhook', {
              topic,
              shop: session.shop,
              result: JSON.stringify(rest.result),
            });
          }
        });
      });

      return response;
    });
  };
}
