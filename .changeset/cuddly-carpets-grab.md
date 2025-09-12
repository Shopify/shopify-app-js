---
'@shopify/shopify-api': major
---

REST API IDs change from number to string

- **BREAKING**: All REST API responses now return ID properties as `string` instead of `number` to prevent precision loss for IDs approaching JavaScript's MAX_SAFE_INTEGER (2^53-1). This affects both REST resources and the REST client.

  #### What Changed
  - All `id` properties changed from `number` to `string`
  - All `*_id` properties (like `product_id`, `customer_id`) changed from `number` to `string`  
  - All `*_ids` array properties (like `variant_ids`) changed from `number[]` to `string[]`

  #### Affected APIs
  - **REST Resources**: `Product.find()`, `Order.save()`, etc.
  - **REST Client**: Direct usage of `shopify.clients.Rest`

  #### Why This Change
  - Shopify IDs are 64-bit integers that can exceed JavaScript's safe integer limit
  - IDs beyond 2^53-1 lose precision when stored as numbers
  - Prevents data corruption for merchants with large IDs

  #### Migration Examples

  **REST Resources:**
  ```typescript
  // Before (v11)
  const product = await shopify.rest.Product.find({session, id: 123});
  if (product.id === 123) { }

  // After (v12)  
  const product = await shopify.rest.Product.find({session, id: "123"});
  if (product.id === "123") { }
  ```

  **REST Client:**
  ```typescript
  // Before (v11)
  const client = new shopify.clients.Rest({ session });
  const response = await client.get({ path: 'products/123' });
  if (response.body.product.id === 123) { }

  // After (v12)
  const client = new shopify.clients.Rest({ session });
  const response = await client.get({ path: 'products/123' });
  if (response.body.product.id === "123") { }  // ID is now a string
  ```

  #### Migration Guide
  See [MIGRATION_GUIDE_V12.md](./MIGRATION_GUIDE_V12.md) for detailed migration instructions.

  #### Backward Compatibility
  - Methods still accept numeric IDs as parameters (automatically converted to strings)
  - Uses lossless-json parsing to preserve precision for large IDs
  - No manual conversion needed for API responses
