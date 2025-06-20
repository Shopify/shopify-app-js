import {Session} from '@shopify/shopify-api';

import {AdminApiContext} from '../../clients';

export interface UnauthenticatedAdminContext {
  /**
   * The session for the given shop.
   *
   * This comes from the session storage which `shopifyApp` uses to store sessions in your database of choice.
   *
   * This will always be an offline session. You can use to get shop-specific data.
   *
   * @example
   * <caption>Using the offline session.</caption>
   * <description>Get your app's shop-specific data using the returned offline `session` object.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs, json } from "react-router";
   * import { unauthenticated } from "../shopify.server";
   * import { getMyAppData } from "~/db/model.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const shop = getShopFromExternalRequest(request);
   *   const { session } = await unauthenticated.admin(shop);
   *   return (await getMyAppData({shop: session.shop}));
   * };
   * ```
   */
  session: Session;

  /**
   * Methods for interacting with the GraphQL Admin API for the given store.
   *
   * @example
   * <caption>Querying the GraphQL API.</caption>
   * <description>Use `admin.graphql` to make query / mutation requests.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { ActionFunctionArgs } from "react-router";
   * import { unauthenticated } from "../shopify.server";
   *
   * export async function action({ request }: ActionFunctionArgs) {
   *  const shop = getShopFromExternalRequest(request);
   *  const { admin } = await unauthenticated.admin(shop);
   *
   *  const response = await admin.graphql(
   *    `#graphql
   *    mutation populateProduct($input: ProductInput!) {
   *      productCreate(input: $input) {
   *        product {
   *          id
   *        }
   *      }
   *     }`,
   *     { variables: { input: { title: "Product Name" } } }
   *   );
   *
   *  const productData = await response.json();
   *  return ({ data: productData.data });
   * }
   * ```
   *
   * ```ts
   * // /app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-react-router/server";
   *
   * const shopify = shopifyApp({
   *  // ...etc
   * });
   * export default shopify;
   * export const unauthenticated = shopify.unauthenticated;
   * ```
   */
  admin: AdminApiContext;
}

export type GetUnauthenticatedAdminContext = (
  shop: string,
) => Promise<UnauthenticatedAdminContext>;
