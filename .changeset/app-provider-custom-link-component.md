---
'@shopify/shopify-app-remix': minor
---

`AppProvider` now accepts an optional `linkComponent` prop, allowing apps to override the default `RemixPolarisLink`. This unblocks use cases like passing Remix's `NavLink` to drive active-route styling for Polaris `Navigation.Item` or `Link`. When omitted, the existing `RemixPolarisLink` is used, so this is a non-breaking addition.

```tsx
import {NavLink} from '@remix-run/react';
import {AppProvider} from '@shopify/shopify-app-remix/react';

<AppProvider apiKey={apiKey} linkComponent={NavLink}>
  <Outlet />
</AppProvider>
```
