# Testing your app

This package exports two helper methods through `@shopify/shopify-api/test-helpers` to simplify integration testing and local end-to-end testing: `setUpValidSession()` and `setUpValidRequest()`. These methods can be used together to fake authorization. `setUpValidSession()` creats a fake session, and `setUpValidRequest()` modifies Requests so that this package authorizes them against the fake session.

## setUpValidSession()

`setUpValidSession()` creates a fake but valid [Session](./session-storage.md#what-data-is-in-a-session-object) to use in testing. The function parameter is used to define the properties of the Session object. All Session properties are optional except `shop`. A companion helper method, `getShopValue()`, is exported to help generate a fake shop URL for the required `shop` property.

```ts
import prisma from '~/db.server';
import { PrismaSessionStorage } from '@shopify/shopify-app-session-storage-prisma';
import { setUpValidSession } from '@shopify/shopify-api/test-helpers';

// set up test Session
const sessionStorage = new PrismaSessionStorage(prisma);
const session = await setUpValidSession({
  shop: getShopValue('test-shop');
});
await sessionStorage.storeSession(session);

... // complete testing here

// tear down test Session
await sessionStorage.deleteSession(session.id);
```

When an end-to-end testing framework runs tests in parallel, and you need a separate Session with a unique `shop` property for each parallel process, you can modify the above code snipped to incorporate a unique process identifier into the shop name, for example:

```ts
...

const session = await setUpValidSession(sessionStorage, {
  shop: getShopValue(`test-shop-${process.env.TEST_PARALLEL_INDEX}`),
});

...
```

## setUpValidRequest()

`setUpValidRequest()` duplicates and decorates a provided Request object with authorization properties to use in testing. The first function parameter determines the authorization method to fake, and provides any inputs required to fake the authorization. There are four authorization methods that can be faked:
1. **Admin**: This authorization method is used by Shopify when making HTTP GET request to your app through the Shopify Admin interface. It appends authorization parameters to the query string of the URL.
1. **Bearer**: This authorization method is used by App Bridge when your app's front-end makes `fetch` requests to your app's back-end. It appends an `authorization` header to the [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request).
1. **Extension**: This authorization method is used by Shopify when making HTTP POST requests to your app extension. It appends authorization headers to the [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request).
1. **Public**: This authorization method is used by Shopify when making requests to an [app proxy](https://shopify.dev/docs/apps/build/online-store/display-dynamic-data#handling-proxy-requests). It appends a `signature` query string parameter to the URL.

Each of these four authorization methods matches an enumerated value on `RequestType`. `RequestType` is exported as a companion to this method.

The `store` property must match the `shop` property used for `setUpValidSession()`, and the `apiKey` and `apiSecretKey` properties must match the `apiKey` and `apiSecretKey` passed to `shopifyApi()`.

```ts
import {
  RequestType,
  setUpValidRequest,
} from '@shopify/shopify-api/test-helpers';

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

// now use authorizedRequest to complete the request, or use the url or headers of authorizedRequest to modify the original request.
```

## Troubleshooting
Some end-to-end testing frameworks run their tests in different environments to the environment in which the Shopify development server is started, so the test environments don't have access to the `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` environmental variables set by the Shopify CLI when running `shopify app dev`. If this is true for your testing framework, you need to manually set the values for `apiKey` and `apiSecretKey` to match values passed to `shopifyApi()`. **NB: DO NOT commit your real API secret to a code respository.**