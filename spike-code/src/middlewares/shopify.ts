import '@shopify/shopify-api/dist/adapters/node';
import {ApiVersion, Shopify} from '@shopify/shopify-api';
import {gdprTopics} from '@shopify/shopify-api/dist/webhooks/registry';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import express from 'express';

import {CONFIG} from '../config';
import {verifyRequest} from './verify-request.js';
import {ensureBilling} from '../helpers/ensure-billing';
import {topLevelAuthRedirect} from '../helpers/top-level-auth-redirect';

export const ACTIVE_SHOPIFY_SHOPS: {[key: string]: string} = {};

function setupRoutes(app: any) {
  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));
  app.use(compression());

  // Set the appropriate CSP headers
  app.use((req: any, res: any, next: any) => {
    const shop = req.query.shop;
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        'Content-Security-Policy',
        `frame-ancestors https://${shop} https://admin.shopify.com;`,
      );
    } else {
      res.setHeader('Content-Security-Policy', `frame-ancestors 'none';`);
    }
    next();
  });

  app.post('/graphql', async (req: any, res: any) => {
    try {
      const response = await Shopify.Utils.graphqlProxy(req, res);
      res.status(200).send(response.body);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
}

function appInstalled(app: any) {
  return (req: any, res: any, next: any) => {
    const shop = req.query.shop;

    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined && shop) {
      res.redirect(`${rootPath(app)}/auth?shop=${shop}`);
    } else {
      next();
    }
  };
}

function rootPath(app: any) {
  return app.mountpath;
}

function initApp(app: any) {
  setupLibrary(app);
  setupRoutes(app);
}

export function shopifyApp() {
  const app = express();

  initApp(app);

  return {
    app,
    session: verifyRequest(app),
    installed: appInstalled(app),
  };
}
