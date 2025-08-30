---
"@shopify/shopify-api": patch
---

Fix adapter initialization issues with modern bundlers (Vite, Webpack) in SSR frameworks

Adds `sideEffects` configuration to package.json to prevent bundlers from incorrectly tree-shaking adapter initialization code. This resolves the "Missing adapter implementation for 'abstractRuntimeString'" error that occurred when using the library with Nuxt 3, TanStack Start, and other frameworks.

The adapters use side effects to initialize runtime functions, and modern bundlers were optimizing these away, causing runtime errors. The fix ensures these critical initialization side effects are preserved during the bundling process.

Some bundlers may still tree-shake pure side-effect imports. If you encounter issues after this update, you can use the newly
   exported `nodeAdapterInitialized` constant to ensure the adapter is loaded:

  ```javascript
  // Instead of just:
  import '@shopify/shopify-api/adapters/node';

  // You can now also import and check:
  import { nodeAdapterInitialized } from '@shopify/shopify-api/adapters/node';
  import { shopifyApi } from '@shopify/shopify-api';

  // Optional: Ensure adapter is initialized (forces bundlers to keep the import)
  if (!nodeAdapterInitialized) {
    throw new Error('Node adapter not initialized');
  }

  const shopify = shopifyApi({
    // your config
  });