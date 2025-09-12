---
'@shopify/shopify-api': major
---

Swapped `jsonwebtoken` dependency for `jose`

If you use the `getJwt` function, it is now async.

Before

```javascript
import {getJwt} from '@shopify/shopify-api/test-helpers';

describe(() => {
  it('tests something', () => {
    const jwt = getJwt(TEST_SHOP_NAME, API_KEY, API_SECRET_KEY)

    //...etc
  })    
})
```

After:

```javascript
import {getJwt} from '@shopify/shopify-api/test-helpers';

describe(() => {
  it('tests something', async () => {
    const jwt = await getJwt(TEST_SHOP_NAME, API_KEY, API_SECRET_KEY)

    //...etc
  })    
})
```

This change gives you smaller packages and more standards compliance.
