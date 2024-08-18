---
'@shopify/shopify-app-remix': minor
'@shopify/shopify-api': minor
---

Test helpers and changes to enable automated unit and e2e testing for @shopify/shopify-app-remix

See [documentation](./packages/apps/shopify-api/docs/guides/test-helpers.md) for examples on how to use these helper methods.

```ts
import prisma from '~/db.server';
import { PrismaSessionStorage } from '@shopify/shopify-app-session-storage-prisma';
import {
  RequestType,
  setUpValidRequest,
  setUpValidSession,
} from '@shopify/shopify-api/test-helpers';

// set up test Session
const sessionStorage = new PrismaSessionStorage(prisma);
const session = await setUpValidSession({
  shop: getShopValue('test-shop');
});
await sessionStorage.storeSession(session);

let request: Request = ... // the request intercepted by end-to-end testing framework

const authorizedRequest = setUpValidRequest(
  {
    type: RequestType.Extension,
    store: `test-shop-${process.env.TEST_PARALLEL_INDEX}`,
    apiKey: ..., // the same value as `apiKey` passed to shopifyApi()
    apiSecretKey: ..., // the same value as `apiSecretKey` passed to shopifyApi()
  },
  request
);

// use authorizedRequest to complete the request, or use the url or headers of authorizedRequest to modify the original request.

... // complete testing here

// tear down test Session
await sessionStorage.deleteSession(session.id);
```
