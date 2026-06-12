---
'@shopify/shopify-app-react-router': major
---

Remove the public non-embedded React Router app configuration surface.

`AppProvider` now always renders App Bridge, requires an `apiKey`, and no longer accepts an `embedded` prop. `shopifyApp` now rejects `isEmbeddedApp` configuration.

To update an app:

- Replace embedded Admin route usage of `AppProvider`:

  ```diff
  - <AppProvider embedded apiKey={apiKey}>
  + <AppProvider apiKey={apiKey}>
      <Outlet />
    </AppProvider>
  ```

- Remove Polaris-only or login-page usage of `AppProvider`:

  ```diff
  - <AppProvider embedded={false}>
  -   <s-page>...</s-page>
  - </AppProvider>
  + <s-page>...</s-page>
  ```

- Remove `isEmbeddedApp` from `shopifyApp` configuration:

  ```diff
    const shopify = shopifyApp({
      // ...
  -   isEmbeddedApp: false,
    });
  ```

For apps based on the React Router template, the dedicated `/auth/login` UI route can be removed. Move the `shopify.login(request)` call into the root route action and have the root login form post to itself instead of `/auth/login`:

```diff
- <Form method="post" action="/auth/login">
+ <Form method="post">
```

Then handle the form submission in the root route:

```ts
export const action = async ({request}: ActionFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return {errors};
};
```

This keeps manual shop-domain login available without keeping a separate non-embedded-looking route that wraps content in `<AppProvider embedded={false}>`.
