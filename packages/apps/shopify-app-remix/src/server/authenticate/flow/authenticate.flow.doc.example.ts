import {type ActionFunctionArgs} from '@remix-run/node';

import {authenticate} from '../shopify.server';

export const action = async ({request}: ActionFunctionArgs) => {
  const {admin, payload} = await authenticate.flow(request);

  const customerId = payload.properties.customer_id;

  const response = await admin.graphql(
    `#graphql
    mutation setMetafield($customerId: ID!, $time: String!) {
      metafieldsSet(metafields: {
        ownerId: $customerId
        namespace: "my-app",
        key: "last_flow_update",
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
        customerId,
        time: new Date().toISOString(),
      },
    },
  );
  const body = await response.json();

  console.log('Updated value', body.data!.metafieldsSet!.metafields![0].value);

  return new Response();
};
