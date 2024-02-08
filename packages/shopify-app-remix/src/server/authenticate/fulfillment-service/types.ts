import {Session, ShopifyRestResources} from '@shopify/shopify-api';

import type {AdminApiContext} from '../../clients';

export interface FulfillmentServiceContext<
  Resources extends ShopifyRestResources = ShopifyRestResources,
> {
  /**
   * A session with an offline token for the shop.
   *
   * Returned only if there is a session for the shop.
   * */
  session: Session;
  /**
   * A session with an offline token for the shop.
   *
   * Returned only if there is a session for the shop.
   *
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
   *
   *   const response = await admin.graphql(
   *     `#graphql
   *     mutation acceptFulfillmentRequest {
   *       fulfillmentOrderAcceptFulfillmentRequest(
   *            id: "gid://shopify/FulfillmentOrder/5014440902678",
   *            message: "Reminder that tomorrow is a holiday. We won't be able to ship this until Monday."){
   *             fulfillmentOrder {
   *                 status
   *                requestStatus
   *            }
   *         }
   *     }
   *    );
   *
   *   const productData = await response.json();
   *   return json({ data: productData.data });
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
   *   const { kind } = await authenticate.fulfillmentService(request);
   *   console.log(kind);
   *   return new Response();
   * };
   * ```
   */
  kind: string;
}

export type AuthenticateFulfillmentService<
  Resources extends ShopifyRestResources = ShopifyRestResources,
> = (request: Request) => Promise<FulfillmentServiceContext<Resources>>;
