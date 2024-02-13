---
"@shopify/shopify-app-remix": minor
---

Introduce Vercel adapter to fix deploys to Vercel.

Since v.9.0.0 of `@shopify/shopify-api` developers deploying their Remix apps to Vercel have encountered errors.

Developers looking to deploy their application to Vercel should replace references to import `"@shopify/shopify-app-remix/adapters/node";` with `"@shopify/shopify-app-remix/adapters/vercel";` to properly load the required global variables.
