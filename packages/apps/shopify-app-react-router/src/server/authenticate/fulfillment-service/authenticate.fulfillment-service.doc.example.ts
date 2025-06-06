import {type ActionFunctionArgs} from '@remix-run/node';

import {authenticate} from '../shopify.server';

export const action = async ({request}: ActionFunctionArgs) => {
  const {admin, payload} = await authenticate.fulfillmentService(request);

  const kind = payload.kind;

  if (kind === 'FULFILLMENT_REQUEST') {
    const response = await admin?.graphql(
      `#graphql
         query {
           shop {
             assignedFulfillmentOrders(first: 10, assignmentStatus: FULFILLMENT_REQUESTED) {
               edges {
                 node {
                   id
                   destination {
                   firstName
                   lastName
                 }
                 lineItems(first: 10) {
                   edges {
                     node {
                     id
                     productTitle
                     sku
                     remainingQuantity
                   }
                 }
               }
               merchantRequests(first: 10, kind: FULFILLMENT_REQUEST) {
                 edges {
                   node {
                     message
                   }
                 }
               }
             }
           }
         }
       }
      }`,
    );

    const fulfillments = await response.json();
    console.log(fulfillments);
  }

  return new Response();
};
