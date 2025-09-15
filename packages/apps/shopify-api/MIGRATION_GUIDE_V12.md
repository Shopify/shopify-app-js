# Migration Guide: v11 to v12

## Overview

Starting in v12.0.0, all Shopify REST resource IDs are now `string` types instead of `number`. This change prevents precision loss for IDs approaching JavaScript's MAX_SAFE_INTEGER (2^53-1 or 9,007,199,254,740,991).

**Why this change?**
- Shopify uses 64-bit integers for IDs
- JavaScript can only safely represent integers up to 2^53-1
- IDs beyond this limit lose precision when handled as numbers

## Breaking Changes

### ID Type Changes

All ID properties in REST resources have changed from `number` to `string`:

```typescript
// Before (v11)
interface Product {
  id: number;
  collection_id: number;
  variant_ids: number[];
}

// After (v12)
interface Product {
  id: string;
  collection_id: string;
  variant_ids: string[];
}
```

This affects:

- Primary IDs (`id`)
- Foreign keys (`*_id` properties like `product_id`, `customer_id`)
- ID arrays (`*_ids` properties like `variant_ids`)

## Migration Steps

### 1. Update TypeScript Types

If you have custom interfaces, update ID types:

```typescript
// Before
interface MyProductData {
  productId: number;
  variantIds: number[];
}

// After
interface MyProductData {
  productId: string;
  variantIds: string[];
}
```

### 2. Update ID Comparisons

Change strict equality checks:

```typescript
// Before
if (product.id === 123) { }
if (order.customer_id === customerId) { } // where customerId is number

// After
if (product.id === "123") { }
if (order.customer_id === customerId) { } // where customerId is string
```

### 3. Update API Calls

**Important:** REST methods accept both number and string IDs for backward compatibility. Numbers are automatically converted to strings internally.

```typescript
// Both of these work in v12:
const product1 = await shopify.rest.Product.find({
  session,
  id: 123    // ✅ Still works - converted to "123" internally
});

const product2 = await shopify.rest.Product.find({
  session,
  id: "123"  // ✅ Recommended - already a string
});

// Note: The returned product.id will always be a string
console.log(typeof product1.id); // "string" 
console.log(product1.id);        // "123"
```

### 4. Handle Mixed Types During Migration

If you have existing numeric IDs in your database or variables:

```typescript
// Option 1: Pass numeric IDs directly (auto-converted)
const numericId = 123; // From your database
const product = await shopify.rest.Product.find({
  session,
  id: numericId  // ✅ Works - auto-converted to "123"
});

// Option 2: Explicitly convert to string (more explicit)
const product2 = await shopify.rest.Product.find({
  session,
  id: String(numericId)  // Also works
});

// Comparing IDs - remember the returned ID is always a string
const dbProductId = 456; // Numeric from database
const apiProduct = await shopify.rest.Product.find({session, id: dbProductId});

if (String(dbProductId) === apiProduct.id) {
  // IDs match - apiProduct.id is "456"
}
```

### ✅ REST Methods Accept Both Number and String IDs

To ease migration, all REST resource methods accept both number and string IDs. The `normalizeId` function internally converts all IDs to strings:

```typescript
// All of these work and are equivalent:
await shopify.rest.Product.find({ session, id: 123 });      // number → "123"
await shopify.rest.Product.find({ session, id: "123" });    // string (recommended)

await shopify.rest.Product.delete({ session, id: 456 });    // number → "456"
await shopify.rest.Product.delete({ session, id: "456" });  // string (recommended)

// The returned resources always have string IDs
const product = await shopify.rest.Product.find({ session, id: 789 });
console.log(typeof product.id);         // "string"
console.log(product.id);                // "789"
console.log(product.variant_ids[0]);    // "12345" (also string)
```
