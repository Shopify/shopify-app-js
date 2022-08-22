import { ApiVersion, Shopify } from "@shopify/shopify-api";
import cookieParser from "cookie-parser";
import fs from "fs";

import { CONFIG, setConfig, ShopifyConfig } from "../config";
import { applyAuthMiddleware } from "./auth.js";
import { verifyRequest } from "./verify-request.js";

const DEFAULT_SQLITE_PATH = `${process.cwd()}/database.sqlite`;

const CONFIG_PATH = `${process.cwd()}/shopify.config.js`;

export async function shopifyMiddleware(app: any, config?: ShopifyConfig) {
  if (fs.existsSync(CONFIG_PATH)) {
    await import(CONFIG_PATH);
  }

  if (config !== undefined) {
    setConfig(config);
  }

  if (!CONFIG.sessionStorage) {
    CONFIG.sessionStorage = new Shopify.Session.SQLiteSessionStorage(
      DEFAULT_SQLITE_PATH
    );
  }

  Shopify.Context.initialize({
    API_KEY: CONFIG.apiKey as string,
    API_SECRET_KEY: CONFIG.apiSecretKey as string,
    SCOPES: CONFIG.scopes as string[],
    HOST_SCHEME: CONFIG.hostScheme,
    HOST_NAME: CONFIG.hostName as string,
    API_VERSION: CONFIG.apiVersion as ApiVersion,
    IS_EMBEDDED_APP: CONFIG.isEmbeddedApp,
    SESSION_STORAGE: CONFIG.sessionStorage,
    USER_AGENT_PREFIX: CONFIG.userAgent,
  });

  for (const topic in CONFIG.webhooks) {
    Shopify.Webhooks.Registry.addHandler(topic, {
      path: `${CONFIG.rootPath}/webhooks`,
      webhookHandler: CONFIG.webhooks[topic],
    });
  }

  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  // Set the appropriate CSP headers
  app.use((req: any, res: any, next: any) => {
    const shop = req.query.shop;
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors https://${shop} https://admin.shopify.com;`
      );
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
    }
    next();
  });

  applyAuthMiddleware(app);

  app.post(`${CONFIG.rootPath}/webhooks`, async (req: any, res: any) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
      if (!res.headersSent) {
        res.status(500).send(error.message);
      }
    }
  });

  app.post(`${CONFIG.rootPath}/graphql`, async (req: any, res: any) => {
    try {
      const response = await Shopify.Utils.graphqlProxy(req, res);
      res.status(200).send(response.body);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  return verifyRequest;
}
