import request from 'supertest';
import express from 'express';
import {
  DeliveryMethod,
  LATEST_API_VERSION,
  LogSeverity,
} from '@shopify/shopify-api';

import {
  shopify,
  TEST_SHOP,
  TEST_WEBHOOK_ID,
  validWebhookHeaders,
} from '../../__tests__/test-helper';
import {process} from '../process';

describe('process', () => {
  const app = express();
  app.post('/webhooks', express.text({type: '*/*'}), async (req, res) => {
    await process({req, res, api: shopify.api, config: shopify.config});
  });

  const mockHandler = jest.fn();

  beforeEach(() => {
    shopify.api.webhooks.addHandlers({
      TEST_TOPIC: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: '/webhooks',
        callback: mockHandler,
      },
    });

    mockHandler.mockReset();
  });

  it('triggers the handler', async () => {
    const body = JSON.stringify({'test-body-received': true});

    await request(app)
      .post('/webhooks')
      .set(
        validWebhookHeaders(
          'TEST_TOPIC',
          body,
          shopify.api.config.apiSecretKey,
        ),
      )
      .send(body)
      .expect(200);

    expect(mockHandler).toHaveBeenCalledWith(
      'TEST_TOPIC',
      TEST_SHOP,
      body,
      TEST_WEBHOOK_ID,
      LATEST_API_VERSION,
    );

    expect(shopify.api.config.logger.log as jest.Mock).toHaveBeenCalledWith(
      LogSeverity.Info,
      expect.stringContaining('Webhook processed, returned status code 200'),
    );
  });

  it('fails gracefully if there is no handler', async () => {
    const body = JSON.stringify({'test-body-received': true});

    await request(app)
      .post('/webhooks')
      .set(
        validWebhookHeaders(
          'UNKNOWN_TOPIC',
          body,
          shopify.api.config.apiSecretKey,
        ),
      )
      .send(body)
      .expect(404);

    expect(shopify.api.config.logger.log as jest.Mock).toHaveBeenCalledWith(
      LogSeverity.Error,
      expect.stringContaining(
        'No HTTP webhooks registered for topic UNKNOWN_TOPIC',
      ),
    );
  });

  it('returns 401 on faulty webhook requests', async () => {
    const body = JSON.stringify({'test-body-received': true});

    const headers = {
      ...validWebhookHeaders(
        'TEST_TOPIC',
        body,
        shopify.api.config.apiSecretKey,
      ),
      'X-Shopify-Hmac-Sha256': 'invalid-hmac',
    };

    await request(app).post('/webhooks').set(headers).send(body).expect(401);

    expect(shopify.api.config.logger.log as jest.Mock).toHaveBeenCalledWith(
      LogSeverity.Error,
      expect.stringContaining(
        'Could not validate request for topic TEST_TOPIC',
      ),
    );
  });

  it('returns a 500 if the handler fails', async () => {
    mockHandler.mockRejectedValueOnce(new Error('test-error'));

    const body = JSON.stringify({'test-body-received': true});

    await request(app)
      .post('/webhooks')
      .set(
        validWebhookHeaders(
          'TEST_TOPIC',
          body,
          shopify.api.config.apiSecretKey,
        ),
      )
      .send(body)
      .expect(500);

    expect(mockHandler).toHaveBeenCalledWith(
      'TEST_TOPIC',
      TEST_SHOP,
      body,
      TEST_WEBHOOK_ID,
      LATEST_API_VERSION,
    );
    expect(shopify.api.config.logger.log as jest.Mock).toHaveBeenCalledWith(
      LogSeverity.Error,
      expect.stringContaining('test-error'),
    );
  });
});
