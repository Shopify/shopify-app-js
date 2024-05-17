import {Session, ShopifyRestResources} from '@shopify/shopify-api';

import type {AdminApiContext} from '../../clients';

export type FulfillmentServicePayload = Record<string, any> & {
  kind: string;
};

export interface FulfillmentServiceContext<
  Resources extends ShopifyRestResources = ShopifyRestResources,
> {
  /**
   * A session with an offline token for the shop.
   *
   * Returned only if there is a session for the shop.
   * @example
   * <caption>Shopify session for the fulfillment service notification request.</caption>
   * <description>Use the session associated with this request to use REST resources.</description>
   * ```ts
   * // /app/routes/fulfillment_service_notification.tsx
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   *   export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { session, admin } = await authenticate.fulfillmentService(request);
   *
   *   const products = await admin?.rest.resources.Product.all({ session });
   *   // Use products
   *
   *   return new Response();
   * };
   * ```
   * */
  session: Session;
  /**
   *
   * An admin context for the fulfillment service request.
   *
   * Returned only if there is a session for the shop.
   * @example
   * <caption>Shopify session for the fulfillment service request.</caption>
   * <description>Use the session associated with this request to use the Admin GraphQL API </description>
   * ```ts
   * // /app/routes/fulfillment_order_notification.ts
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export async function action({ request }: ActionFunctionArgs) {
   *   const { admin } = await authenticate.fulfillmentService(request);
   *   const response = await admin?.graphql(
   *  `#graphql
   *    query {
   *      shop {
   *        assignedFulfillmentOrders(first: 10, assignmentStatus: FULFILLMENT_REQUESTED) {
   *          edges {
   *            node {
   *              id
   *              destination {
   *              firstName
   *              lastName
   *            }
   *            lineItems(first: 10) {
   *              edges {
   *                node {
   *                id
   *                productTitle
   *                sku
   *                remainingQuantity
   *              }
   *            }
   *          }
   *          merchantRequests(first: 10, kind: FULFILLMENT_REQUEST) {
   *            edges {
   *              node {
   *                message
   *              }
   *            }
   *          }
   *        }
   *      }
   *    }
   *  }
   * }`);
   *
   *   const fulfillments = await response.json();
   *   return json({ data: fulfillments.data });
   * }
   * ```
   */
  admin: AdminApiContext<Resources>;

  /**
   * The payload from the fulfillment service request.
   *
   * @example
   * <caption>Fulfillment service request payload.</caption>
   * <description>Get the request's POST payload.</description>
   * ```ts
   * /app/routes/fulfillment_order_notification.ts
   * import { ActionFunction } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const action: ActionFunction = async ({ request }) => {
   *   const { payload } = await authenticate.fulfillmentService(request);
   *   if(payload.kind === 'FULFILLMENT_REQUEST') {
   *    // handle fulfillment request
   *   } else if (payload.kind === 'CANCELLATION_REQUEST') {
   *    // handle cancellation request
   *   };
   * return new Response();
   * ```
   */
  payload: FulfillmentServicePayload;
}

export type AuthenticateFulfillmentService<
  Resources extends ShopifyRestResources = ShopifyRestResources,
> = (request: Request) => Promise<FulfillmentServiceContext<Resources>>;
