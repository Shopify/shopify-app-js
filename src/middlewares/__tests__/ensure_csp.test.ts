import request from 'supertest';
import express, {Express} from 'express';
import {Session} from '@shopify/shopify-api';

import {shopify, SHOPIFY_HOST, TEST_SHOP} from '../../__tests__/test-helper';

const TESTS = [
  {
    isEmbeddedApp: true,
    expectedCSP: `frame-ancestors https://${TEST_SHOP} https://admin.shopify.com;`,
  },
  {
    isEmbeddedApp: false,
    expectedCSP: `frame-ancestors 'none';`,
  },
];

TESTS.forEach((config) => {
  describe('ensureCSP', () => {
    let app: Express;
    let session: Session;
    const htmlPage =
      '<html><head></head><body><h1>Hello, World!</h1></body></html>';

    beforeEach(async () => {
      app = express();
      shopify.api.config.isEmbeddedApp = config.isEmbeddedApp;
      app.use('/api', shopify.auth());
      app.use('/*', shopify.ensureCSP());
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

    it(`sets correct CSP header for isEmbedded = ${config.isEmbeddedApp}`, async () => {
      await shopify.api.config.sessionStorage.storeSession(session);

      const encodedHost = Buffer.from(SHOPIFY_HOST, 'utf-8').toString('base64');
      const response = await request(app)
        .get(`/?shop=${TEST_SHOP}&host=${encodedHost}&embedded=1`)
        .expect(200);

      expect(response.text).toEqual(htmlPage);
      expect(response.headers['content-security-policy']).toEqual(
        config.expectedCSP,
      );
    });
  });
});
