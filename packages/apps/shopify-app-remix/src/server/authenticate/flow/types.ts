import {Session, ShopifyRestResources} from '@shopify/shopify-api';

import type {AdminApiContext} from '../../clients';

export interface FlowContext<
  Resources extends ShopifyRestResources = ShopifyRestResources,
> {
  /**
   * A session with an offline token for the shop.
   *
   * Returned only if there is a session for the shop.
   *
   * @example
   * <caption>Shopify session for the Flow request.</caption>
   * <description>Use the session associated with this request to use REST resources.</description>
   * ```ts
   * // /app/routes/flow.tsx
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { session, admin } = await authenticate.flow(request);
   *
   *   const products = await admin?.rest.resources.Product.all({ session });
   *   // Use products
   *
   *   return new Response();
   * };
   * ```
   */
  session: Session;

  /**
   * The payload from the Flow request.
   *
   * @example
   * <caption>Flow payload.</caption>
   * <description>Get the request's POST payload.</description>
   * ```ts
   * // /app/routes/flow.tsx
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { payload } = await authenticate.flow(request);
   *   return new Response();
   * };
   * ```
   */
  payload: any;

  /**
   * An admin context for the Flow request.
   *
   * Returned only if there is a session for the shop.
   *
   * @example
   * <caption>Flow admin context.</caption>
   * <description>Use the `admin` object in the context to interact with the Admin API.</description>
   * ```ts
   * // /app/routes/flow.tsx
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export async function action({ request }: ActionFunctionArgs) {
   *   const { admin } = await authenticate.flow(request);
   *
   *   const response = await admin?.graphql(
   *     `#graphql
   *     mutation populateProduct($input: ProductInput!) {
   *       productCreate(input: $input) {
   *         product {
   *           id
   *         }
   *       }
   *     }`,
   *     { variables: { input: { title: "Product Name" } } }
   *   );
   *
   *   const productData = await response.json();
   *   return json({ data: productData.data });
   * }
   * ```
   */
  admin: AdminApiContext<Resources>;
}

export type AuthenticateFlow<
  Resources extends ShopifyRestResources = ShopifyRestResources,
> = (request: Request) => Promise<FlowContext<Resources>>;
