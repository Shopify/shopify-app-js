import request from 'supertest';
import express from 'express';
import {DeliveryMethod} from '@shopify/shopify-api';

import {
  shopify,
  TEST_SHOP,
  validWebhookHeaders,
} from '../../__tests__/test-helper';
import {process} from '../process';
import {addWebhookHandlers} from '../add-webhook-handlers';

describe('process', () => {
  const app = express();
  app.post('/webhooks', express.text({type: '*/*'}), async (req, res) => {
    await process({req, res, api: shopify.api});
  });

  const mockHandler = jest.fn();

  let consoleLogMock: jest.SpyInstance;
  beforeEach(() => {
    consoleLogMock = jest.spyOn(global.console, 'log').mockImplementation();

    shopify.config.webhooks.handlers = [
      {
        deliveryMethod: DeliveryMethod.Http,
        topic: 'TEST_TOPIC',
        handler: mockHandler,
      },
    ];

    addWebhookHandlers({api: shopify.api, config: shopify.config});

    mockHandler.mockReset();
  });

  afterEach(() => {
    consoleLogMock.mockRestore();
  });

  it('triggers the handler', async () => {
    const body = JSON.stringify({'test-body-received': true});

    await request(app)
      .post('/webhooks')
      .set(validWebhookHeaders(body, shopify.api.config.apiSecretKey))
      .send(body)
      .expect(200);

    expect(mockHandler).toHaveBeenCalledWith('TEST_TOPIC', TEST_SHOP, body);
    expect(consoleLogMock).toHaveBeenCalledWith(
      'Webhook processed, returned status code 200',
    );
  });

  it('fails gracefully if there is no handler', async () => {
    const body = JSON.stringify({'test-body-received': true});

    const headers = {
      ...validWebhookHeaders(body, shopify.api.config.apiSecretKey),
      'X-Shopify-Topic': 'UNKNOWN_TOPIC',
    };

    await request(app).post('/webhooks').set(headers).send(body).expect(404);
  });

  it('returns 401 on faulty webhook requests', async () => {
    const body = JSON.stringify({'test-body-received': true});

    const headers = {
      ...validWebhookHeaders(body, shopify.api.config.apiSecretKey),
      'X-Shopify-Hmac-Sha256': 'invalid-hmac',
    };

    await request(app).post('/webhooks').set(headers).send(body).expect(401);
  });
});
