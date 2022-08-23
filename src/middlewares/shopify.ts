import { ApiVersion, Shopify } from "@shopify/shopify-api";
import { gdprTopics } from "@shopify/shopify-api/dist/webhooks/registry";
import cookieParser from "cookie-parser";
import compression from "compression";
import fs from "fs";
import express from "express";

import { CONFIG } from "../config";
import { verifyRequest } from "./verify-request.js";
import { ensureBilling } from "../helpers/ensure-billing";
import { topLevelAuthRedirect } from "../helpers/top-level-auth-redirect";

const CONFIG_PATH = `${process.cwd()}/shopify.config.js`;

export const ACTIVE_SHOPIFY_SHOPS: {[key: string]: string} = {};

function setupLibrary(app: any) {
  if (!CONFIG.sessionStorage) {
    CONFIG.sessionStorage = new Shopify.Session.SQLiteSessionStorage(
      CONFIG.defaultSqlitePath
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
      path: `${rootPath(app)}/webhooks`,
      webhookHandler: CONFIG.webhooks[topic],
    });
  }
}

function setupRoutes(app: any) {
  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));
  app.use(compression());

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

  const authPath = `/auth`;
  const topLevelPath = `${authPath}/toplevel`;
  const authCallbackPath = `${authPath}/callback`;

  app.get(authPath, async (req: any, res: any) => {
    if (!req.query.shop) {
      res.status(500);
      return res.send("No shop provided");
    }

    if (!req.signedCookies["shopify_top_level_oauth"]) {
      return res.redirect(
        `${rootPath(app)}${topLevelPath}?shop=${req.query.shop}`
      );
    }

    const redirectUrl = await Shopify.Auth.beginAuth(
      req,
      res,
      req.query.shop,
      `${rootPath(app)}${authCallbackPath}`,
      CONFIG.useOnlineTokens
    );

    res.redirect(redirectUrl);
  });

  app.get(topLevelPath, (req: any, res: any) => {
    res.cookie("shopify_top_level_oauth", "1", {
      signed: true,
      httpOnly: true,
      sameSite: "strict",
    });

    res.set("Content-Type", "text/html");

    res.send(
      topLevelAuthRedirect({
        apiKey: Shopify.Context.API_KEY,
        hostName: Shopify.Context.HOST_NAME,
        shop: req.query.shop,
        rootPath: rootPath(app),
      })
    );
  });

  app.get(authCallbackPath, async (req: any, res: any) => {
    try {
      const session = await Shopify.Auth.validateAuthCallback(
        req,
        res,
        req.query
      );

      const host = req.query.host;
      ACTIVE_SHOPIFY_SHOPS[session.shop] = session.scope as string;

      const responses = await Shopify.Webhooks.Registry.registerAll({
        shop: session.shop,
        accessToken: session.accessToken as string,
      });

      Object.entries(responses).map(([topic, response]) => {
        // The response from registerAll will include errors for the GDPR topics.  These can be safely ignored.
        // To register the GDPR topics, please set the appropriate webhook endpoint in the
        // 'GDPR mandatory webhooks' section of 'App setup' in the Partners Dashboard.
        if (!response.success && !gdprTopics.includes(topic)) {
          console.log(
            `Failed to register ${topic} webhook: ${(response.result as {[key: string]: any}).errors[0].message}`
          );
        }
      });

      // If billing is required, check if the store needs to be charged right away to minimize the number of redirects.
      let redirectUrl = `/?shop=${session.shop}&host=${host}`;
      if (CONFIG.billing.required) {
        const [hasPayment, confirmationUrl] = await ensureBilling(session);

        if (!hasPayment) {
          redirectUrl = confirmationUrl as string;
        }
      }

      // Redirect to app with shop parameter upon auth
      res.redirect(redirectUrl);
    } catch (e) {
      console.warn(e);
      switch (true) {
        case e instanceof Shopify.Errors.InvalidOAuthError:
          res.status(400);
          res.send(e.message);
          break;
        case e instanceof Shopify.Errors.CookieNotFound:
        case e instanceof Shopify.Errors.SessionNotFound:
          // This is likely because the OAuth session cookie expired before the merchant approved the request
          res.redirect(`${rootPath(app)}${authPath}?shop=${req.query.shop}`);
          break;
        default:
          res.status(500);
          res.send(e.message);
          break;
      }
    }
  });

  app.post("/webhooks", async (req: any, res: any) => {
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

  app.post("/graphql", async (req: any, res: any) => {
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
  let promise;
  if (fs.existsSync(CONFIG_PATH)) {
    promise = import(CONFIG_PATH);
  } else {
    promise = Promise.resolve();
  }

  promise.then(() => {
    setupLibrary(app);
    setupRoutes(app);
  });
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
