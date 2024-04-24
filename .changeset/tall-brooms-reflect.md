---
"@shopify/shopify-app-remix": patch
---

Removed `@remix-run/node` as a direct dependency. Any app using the Vercel adapter already needs `@remix-run/node`, so this shouldn't affect any apps.
