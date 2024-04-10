import {type ActionFunctionArgs} from '@remix-run/node';

import {authenticate} from '../shopify.server';

export const action = async ({request}: ActionFunctionArgs) => {
  const {topic, admin, payload} = await authenticate.webhook(request);

  switch (topic) {
    case 'PRODUCTS_UPDATE':
      await admin.graphql(
        `#graphql
        mutation setMetafield($productId: ID!, $time: String!) {
          metafieldsSet(metafields: {
            ownerId: $productId
            namespace: "my-app",
            key: "webhook_received_at",
            value: $time,
            type: "string",
          }) {
            metafields {
              key
              value
            }
          }
        }
        `,
        {
          variables: {
            productId: payload.admin_graphql_api_id,
            time: new Date().toISOString(),
          },
        },
      );

      return new Response();
  }

  throw new Response();
};
