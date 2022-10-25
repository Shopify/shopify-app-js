import {LogSeverity} from '@shopify/shopify-api';

import {WebhookProcessParams} from './types';

export async function process({
  req,
  res,
  api,
}: WebhookProcessParams): Promise<void> {
  try {
    await api.webhooks.process({
      rawBody: req.body,
      rawRequest: req,
      rawResponse: res,
    });

    await api.config.logFunction(
      LogSeverity.Info,
      'Webhook processed, returned status code 200',
    );
  } catch (error) {
    await api.config.logFunction(
      LogSeverity.Error,
      `Failed to process webhook: ${error}`,
    );

    // The library will respond even if the handler throws an error
  }
}
