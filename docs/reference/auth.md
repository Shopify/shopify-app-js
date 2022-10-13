# `shopify.auth()`

This function creates an Express middleware that contains the endpoints necessary to authenticate apps with Shopify.

It will redirect to the app within Shopify when OAuth completes, unless the `afterAuth` callback triggers a different redirect.

## Example

```ts
const app = express();

const authMiddleware = shopify.auth({
  afterAuth: async ({req, res, session}) => {
    // ...
  },
});

app.use('/shopify', authMiddleware);
```

## Parameters

### afterAuth

`Function`

Callback called after OAuth completes to enable custom app behaviour. Receives an object with the following parameters:

- `req`: `express.Request`
- `res`: `express.Response`
- `session`: `Session`

For example, the following callback will check for and request payment after OAuth if the merchant hasn't paid for the app yet.

```ts
const afterAuth = async ({req, res, session}) => {
  const hasPayment = await shopify.api.billing.check({
    session,
    plans: ['My plan'],
    isTest: true,
  });

  if (!hasPayment) {
    res.redirect(
      await shopify.api.billing.request({
        session,
        plan: 'My plan',
        isTest: true,
      }),
    );
  }
};

app.use('/shopify', shopify.auth({afterAuth}));
```

> **Note**: the above example doesn't have to trigger a redirect back to the app if payment exists - the package will do that by default.
