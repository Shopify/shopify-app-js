import {Session, ShopifyRestResources} from '@shopify/shopify-api';

import {AdminApiContext} from '../../clients';

export interface UnauthenticatedAdminContext<
  Resources extends ShopifyRestResources,
> {
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
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { unauthenticated } from "../shopify.server";
   * import { getMyAppData } from "~/db/model.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const shop = getShopFromExternalRequest(request);
   *   const { session } = await unauthenticated.admin(shop);
   *   return json(await getMyAppData({shop: session.shop));
   * };
   * ```
   */
  session: Session;

  /**
   * Methods for interacting with the GraphQL / REST Admin APIs for the given store.
   *
   * @example
   * <caption>Performing a GET request to the REST API.</caption>
   * <description>Use `admin.rest.get` to make custom requests to make a request to to the `customer/count` endpoint</description>
   *
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { unauthenticated } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *  const { admin, session } = await unauthenticated.admin(request);
   *
   *  const response = await admin.rest.get(
   *    {
   *      path: "/customers/count.json"
   *    }
   *  );
   *  const customers = await response.json();
   *
   *  return json({ customers });
   * };
   * ```
   *
   * ```ts
   * // /app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   * import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
   *
   * const shopify = shopifyApp({
   *  restResources,
   *  // ...etc
   * });
   *
   * export default shopify;
   * export const unauthenticated = shopify.unauthenticated;
   * ```
   * @example
   * <caption>Querying the GraphQL API.</caption>
   * <description>Use `admin.graphql` to make query / mutation requests.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { unauthenticated } from "../shopify.server";
   *
   * export async function action({ request }: ActionFunctionArgs) {
   *  const { admin } = await unauthenticated.admin(request);
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
   *  return json({ data: productData.data });
   * }
   * ```
   *
   * ```ts
   * // /app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *  restResources,
   *  // ...etc
   * });
   * export default shopify;
   * export const unauthenticated = shopify.unauthenticated;
   * ```
   */
  admin: AdminApiContext<Resources>;
}

export type GetUnauthenticatedAdminContext<
  Resources extends ShopifyRestResources,
> = (shop: string) => Promise<UnauthenticatedAdminContext<Resources>>;
