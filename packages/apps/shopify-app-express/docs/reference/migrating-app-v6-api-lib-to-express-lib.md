# Instructions to migrate an app based on v6 API library to use this Express library

If you have an Express app that has been migrated to use version 6 of the `@shopify/shopify-api` library, this guide will show how to migrate to using this Express library.

> **Note** This guide uses Shopify's node app template to demonstate the migration steps. Your app will likely have additional functionality that will need similar migration.

> **Note** If you wish to practice this migration prior to applying it to your own app, create an app with one of the following commands, based on your package manager preference:
>
> ```shell
> yarn create @shopify/app --template https://github.com/Shopify/shopify-app-template-node#cli_three_api_six
> # or
> npm init @shopify/app@latest -- --template https://github.com/Shopify/shopify-app-template-node#cli_three_api_six
> # or
> pnpm create @shopify/app@latest --template https://github.com/Shopify/shopify-app-template-node#cli_three_api_six
> ```

## Steps

### 1. Change into the `web` directory

This is root directory of where most of the changes will occur.

```shell
cd web
```

### 2. Update the project to use `v1` of the `@shopify/shopify-app-express` package

```shell
yarn remove @shopify/shopify-api cookie-parser express
yarn add @shopify/shopify-app-express
# or
npm uninstall @shopify/shopify-api cookie-parser express
npm install @shopify/shopify-app-express
# or
pnpm uninstall @shopify/shopify-api cookie-parser express
pnpm install @shopify/shopify-app-express
```

### 3. Update the `gdpr.js` file

This file needs to be updated to export a structure of webhook handlers that can then be passed to the Shopify Express app object. The comments have been removed from the code below for brevity.

```diff
 import { DeliveryMethod } from "@shopify/shopify-api";
-import shopify from "./shopify.js";

-export async function setupGDPRWebHooks(path) {
+export default {
-  await shopify.webhooks.addHandlers({
-    CUSTOMERS_DATA_REQUEST: {
-      deliveryMethod: DeliveryMethod.Http,
-      callbackUrl: path,
-      callback: async (topic, shop, body, webhookId) => {
-        const payload = JSON.parse(body);
-      },
+  CUSTOMERS_DATA_REQUEST: {
+    deliveryMethod: DeliveryMethod.Http,
+    callbackUrl: "/api/webhooks",
+    callback: async (topic, shop, body, webhookId) => {
+      const payload = JSON.parse(body);
     },
-  });
+  },

-  await shopify.webhooks.addHandlers({
-    CUSTOMERS_REDACT: {
-      deliveryMethod: DeliveryMethod.Http,
-      callbackUrl: path,
-      callback: async (topic, shop, body, webhookId) => {
-        const payload = JSON.parse(body);
-      },
+  CUSTOMERS_REDACT: {
+    deliveryMethod: DeliveryMethod.Http,
+    callbackUrl: "/api/webhooks",
+    callback: async (topic, shop, body, webhookId) => {
+      const payload = JSON.parse(body);
     },
-  });
+  },

-  await shopify.webhooks.addHandlers({
-    SHOP_REDACT: {
-      deliveryMethod: DeliveryMethod.Http,
-      callbackUrl: path,
-      callback: async (topic, shop, body, webhookId) => {
-        const payload = JSON.parse(body);
-      },
+  SHOP_REDACT: {
+    deliveryMethod: DeliveryMethod.Http,
+    callbackUrl: "/api/webhooks",
+    callback: async (topic, shop, body, webhookId) => {
+      const payload = JSON.parse(body);
     },
-  });
-}
+  },
+};
```

### 4. Update the `shopify.js` file

When using the Express library, the Shopify API library will be available via the Shopify Express object. The Express object also requires an implementation of `SessionStorage` to manage the storage of sessions on behalf of the application.

```diff
-import "@shopify/shopify-api/adapters/node";
-import { shopifyApi, BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
+import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
+import { shopifyApp } from "@shopify/shopify-app-express";
+import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
 let { restResources } = await import(
   `@shopify/shopify-api/rest/admin/${LATEST_API_VERSION}`
 );

+const DB_PATH = `${process.cwd()}/database.sqlite`;

 // The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
 // See the ensureBilling helper to learn more about billing in this template.
 const billingConfig = {
   "My Shopify One-Time Charge": {
     // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
     amount: 5.0,
     currencyCode: "USD",
     interval: BillingInterval.OneTime,
   },
 };

-const apiConfig = {
-  apiKey: process.env.SHOPIFY_API_KEY,
-  apiSecretKey: process.env.SHOPIFY_API_SECRET,
-  scopes: process.env.SCOPES.split(","),
-  hostName: process.env.HOST.replace(/https?:\/\//, ""),
-  hostScheme: process.env.HOST.split("://")[0],
-  apiVersion: LATEST_API_VERSION,
-  isEmbeddedApp: true,
-  ...(process.env.SHOP_CUSTOM_DOMAIN && {
-    customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN],
-  }),
-  billing: undefined, // or replace with billingConfig above to enable example billing
-  restResources,
-};
-
-const shopify = shopifyApi(apiConfig);
+const shopify = shopifyApp({
+  api: {
+    apiVersion: LATEST_API_VERSION,
+    billingConfig: undefined, // or replace with billingConfig above to enable example billing
+    restResources,
+  },
+  auth: {
+    path: "/api/auth",
+    callbackPath: "/api/auth/callback",
+  },
+  webhooks: {
+    path: "/api/webhooks",
+  },
+  // This should be replaced with your preferred storage strategy
+  sessionStorage: new SQLiteSessionStorage(DB_PATH),
+});

 export default shopify;

```

> **Note** All the other API configuration values will default to
>
> ```ts
> {
>   apiKey: process.env.SHOPIFY_API_KEY,
>   apiSecretKey: process.env.SHOPIFY_API_SECRET,
>   scopes: process.env.SCOPES.split(","),
>   hostName: process.env.HOST.replace(/https?:\/\//, ""),
>   hostScheme: process.env.HOST.split("://")[0],
>   isEmbeddedApp: true,
> }
> ```

### 5. Move the `helpers/product-creater.js` file up one level ...

Move the file from the `helpers` directory to the `web` directory. Assuming your terminal is in the `web` directory:

```shell
# Unix OS, e.g., macOS, Linux, etc.
mv helpers/product-creator.js .
# Windows
move helpers\product-creator.js .
```

### 6. ... and update it to use the `shopify` Express instance

Note that the `ADJECTIVES` and `NOUN` constants remain the same but have been collapsed/hidden below for brevity.

```diff
 import { GraphqlQueryError } from "@shopify/shopify-api";
-import shopify from "../shopify.js";
+import shopify from "./shopify.js";

 const ADJECTIVES = [ ...
 ];

 const NOUNS = [ ...
 ];

 export const DEFAULT_PRODUCTS_COUNT = 5;
 const CREATE_PRODUCTS_MUTATION = `
   mutation populateProduct($input: ProductInput!) {
     productCreate(input: $input) {
       product {
         id
       }
     }
   }
 `;

 export default async function productCreator(
   session,
   count = DEFAULT_PRODUCTS_COUNT
 ) {
-  const client = new shopify.clients.Graphql({ session });
+  const client = new shopify.api.clients.Graphql({ session });

   try {
     for (let i = 0; i < count; i++) {
       await client.query({
         data: {
           query: CREATE_PRODUCTS_MUTATION,
           variables: {
             input: {
               title: `${randomTitle()}`,
               variants: [{ price: randomPrice() }],
             },
           },
         },
       });
     }
   } catch (error) {
     if (error instanceof GraphqlQueryError) {
       throw new Error(
         `${error.message}\n${JSON.stringify(error.response, null, 2)}`
       );
     } else {
       throw error;
     }
   }
 }

 function randomTitle() {
   const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
   const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
   return `${adjective} ${noun}`;
 }

 function randomPrice() {
   return Math.round((Math.random() * 10 + Number.EPSILON) * 100) / 100;
 }
```

### 7. Remove unused files

The following files can now be deleted, as their functionality has now been incorporated into the Express library.

> **Note** These paths are relative to the `web` directory

| Filename                                  | Note                                                                                                                                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sqlite-session-storage.js`               | An instance of `SQLiteSessionStorage` is passed as a configuration item to `shopifyApp` in `shopify.js`, so that the Shopify Express library can manage session storage directly. |
| `app_installations.js`                    | The Shopify Express library uses the session storage to internally track app installations.                                                                                       |
| `helpers/ensure-billing.js`               | :warning: maybe this needs to be retained as an example middleware?                                                                                                               |
| `helpers/redirect-to-auth.js`             | This functionality is now incorporated into the Shopify Express library.                                                                                                          |
| `helpers/return-top-level-redirection.js` | This functionality is now incorporated into the Shopify Express library.                                                                                                          |
| `middleware/auth.js`                      | This functionality is now incorporated into the Shopify Express library.                                                                                                          |
| `middleware/verify-request.js`            | This functionality is now incorporated into the Shopify Express library.                                                                                                          |

### 8. Update the `index.js` file

Replace the `index.js` file with the code below.

```ts
import {join} from 'path';
import {readFileSync} from 'fs';
import express from 'express';
import serveStatic from 'serve-static';

import shopify from './shopify.js';
import productCreator from './product-creator.js';
import GDPRWebhookHandlers from './gdpr.js';

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === 'production'
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot(),
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({webhookHandlers: GDPRWebhookHandlers}),
);

// All endpoints after this point will require an active session
app.use('/api/*', shopify.validateAuthenticatedSession());

app.use(express.json());

app.get('/api/products/count', async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.get('/api/products/create', async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({success: status === 200, error});
});

app.use(serveStatic(STATIC_PATH, {index: false}));

app.use('/*', shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set('Content-Type', 'text/html')
    .send(readFileSync(join(STATIC_PATH, 'index.html')));
});

app.listen(PORT);
```
