---
'@shopify/shopify-app-react-router': major
---

Load Polaris web components 2.x by default. `AppProvider` now renders `<script src="https://cdn.shopify.com/shopifycloud/polaris-2.js">` and `shopifyApp` preloads the same URL in the document `Link` header, instead of `https://cdn.shopify.com/shopifycloud/polaris.js` (which stays on Polaris 1.x).

Polaris 2.0 renders the new Admin Next theme by default, so your app's UI will look different after updating. `polaris-2.js` follows the latest stable 2.x release; use `polaris-2.0.js` to pin to 2.0.

To stay on Polaris 1.x, set `polarisUrl` in both places so the script tag and the preload header match:

```diff
  <AppProvider
    apiKey={apiKey}
+   polarisUrl="https://cdn.shopify.com/shopifycloud/polaris-1.js"
  >
    <Outlet />
  </AppProvider>
```

```diff
  const shopify = shopifyApp({
    // ...
+   polarisUrl: "https://cdn.shopify.com/shopifycloud/polaris-1.js",
  });
```
