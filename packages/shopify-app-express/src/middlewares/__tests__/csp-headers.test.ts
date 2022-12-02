import request from 'supertest';
import express from 'express';
import {Session} from '@shopify/shopify-api';

import {shopify, SHOPIFY_HOST, TEST_SHOP} from '../../__tests__/test-helper';
// import {ShopifyApp, shopifyApp} from '../../index';

const TESTS: {
  isEmbeddedApp: boolean;
  expectedCSP: string;
  shop: any;
}[] = [];

[true, false].forEach((isEmbeddedApp) => {
  [TEST_SHOP, 12345, undefined].forEach((shop) => {
    let expectedCSP = `frame-ancestors 'none';`;
    if (isEmbeddedApp && typeof shop === 'string') {
      expectedCSP = `frame-ancestors https://${shop} https://admin.shopify.com;`;
    }
    TESTS.push({shop, isEmbeddedApp, expectedCSP});
  });
});

describe('cspHeaders', () => {
  let session: Session;
  let app: express.Express;
  const htmlPage =
    '<html><head></head><body><h1>Hello, World!</h1></body></html>';

  beforeEach(async () => {
    app = express();
    app.use('/*', shopify.cspHeaders());
    app.get('/', async (_req, res) => {
      res.send(htmlPage);
    });

    session = new Session({
      id: '123-this-is-a-session-id',
      shop: TEST_SHOP,
      state: '123-this-is-a-state',
      isOnline: shopify.config.useOnlineTokens,
      scope: shopify.api.config.scopes.toString(),
      expires: undefined,
      accessToken: 'totally-real-access-token',
    });
  });

  TESTS.forEach((config) => {
    it(`sets correct CSP header for ${JSON.stringify(config)}`, async () => {
      shopify.api.config.isEmbeddedApp = config.isEmbeddedApp;

      await shopify.config.sessionStorage.storeSession(session);

      const encodedHost = Buffer.from(SHOPIFY_HOST, 'utf-8').toString('base64');
      let shopParam = '';
      if (config.shop) {
        shopParam = `shop=${config.shop}`;
      }
      const response = await request(app)
        .get(`/?${shopParam}&host=${encodedHost}&embedded=1`)
        .expect(200);

      expect(response.text).toEqual(htmlPage);
      expect(response.headers['content-security-policy']).toEqual(
        config.expectedCSP,
      );
    });
  });
});
