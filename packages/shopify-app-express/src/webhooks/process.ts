import {WebhookProcessParams} from './types';

export async function process({
  req,
  res,
  api,
  config,
}: WebhookProcessParams): Promise<void> {
  try {
    await api.webhooks.process({
      rawBody: req.body,
      rawRequest: req,
      rawResponse: res,
    });

    await config.logger.info('Webhook processed, returned status code 200');
  } catch (error) {
    await config.logger.error(`Failed to process webhook: ${error}`);

    // The library will respond even if the handler throws an error
  }
}
