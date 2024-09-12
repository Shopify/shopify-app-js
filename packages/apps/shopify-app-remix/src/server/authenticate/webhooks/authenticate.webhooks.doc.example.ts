import {type ActionFunctionArgs} from '@remix-run/node';

import {authenticate} from '../shopify.server';

export const action = async ({request}: ActionFunctionArgs) => {
  const {topic, admin, payload, session} = await authenticate.webhook(request);

  // Webhook requests can trigger after an app is uninstalled
  // If the app is already uninstalled, the session may be undefined.
  if (!session) {
    throw new Response();
  }

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
  }

  return new Response();
};
