---
'@shopify/graphql-client': minor
---

Make fetch's keepalive configurable when making requests

Example:
```typescript
const shopQuery = `
  query ShopQuery {
    shop {
      name
      id
    }
  }
`;

const {data, errors, extensions} = await client.request(shopQuery, {
  keepalive: true,
});
```
