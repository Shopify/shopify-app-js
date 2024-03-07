---
"@shopify/shopify-app-remix": minor
---

Adds an API to authenticate fulfillment service notifications

Learn more about [fulfillment service apps](https://shopify.dev/docs/apps/fulfillment/fulfillment-service-apps/manage-fulfillments).

```
//app/routes/fulfillment_order_notification.jsx

import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
    const { admin, payload } = await authenticate.fulfillmentService(request);

    if (!admin) {
      throw new Response();
    }
    console.log(payload.kind, 'kind'); //FULFILLMENT_REQUEST
    throw new Response();
  };
```
