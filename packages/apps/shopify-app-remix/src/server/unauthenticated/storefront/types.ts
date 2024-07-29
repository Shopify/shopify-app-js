import {Session} from '@shopify/shopify-api';

import type {StorefrontContext} from '../../clients';

export interface UnauthenticatedStorefrontContext {
  /**
   * The session for the given shop.
   *
   * This comes from the session storage which `shopifyApp` uses to store sessions in your database of choice.
   *
   * This will always be an offline session. You can use this to get shop specific data.
   *
   * @example
   * <caption>Using the offline session.</caption>
   * <description>Get your app's shop-specific data using the returned offline `session` object.</description>
   * ```ts
   * // app/routes/**\/.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { unauthenticated } from "../shopify.server";
   * import { getMyAppData } from "~/db/model.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const shop = getShopFromExternalRequest(request);
   *   const { session } = await unauthenticated.storefront(shop);
   *   return json(await getMyAppData({shop: session.shop));
   * };
   * ```
   */
  session: Session;

  /**
   * Method for interacting with the Shopify GraphQL Storefront API for the given store.
   *
   * @example
   * <caption>Querying the GraphQL API.</caption>
   * <description>Use `storefront.graphql` to make query / mutation requests.</description>
   * ```ts
   * // app/routes/**\/.ts
   * import { json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export async function action({ request }: ActionFunctionArgs) {
   *   const shop = getShopFromExternalRequest(request);
   *   const { storefront } = await unauthenticated.storefront(shop);
   *
   *   const response = await storefront.graphql(`{blogs(first: 10) { edges { node { id } } } }`);
   *
   *   return json(await response.json());
   * }
   * ```
   *
   * @example
   * <caption>Handling GraphQL errors.</caption>
   * <description>Catch `GraphqlQueryError` errors to see error messages from the API.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const shop = getShopFromExternalRequest(request);
   *   const { storefront } = await unauthenticated.storefront(shop);
   *
   *   try {
   *     const response = await storefront.graphql(
   *       `#graphql
   *       query incorrectQuery {
   *         products(first: 10) {
   *           nodes {
   *             not_a_field
   *           }
   *         }
   *       }`,
   *     );
   *
   *     return json({ data: await response.json() });
   *   } catch (error) {
   *     if (error instanceof GraphqlQueryError) {
   *       // { errors: { graphQLErrors: [
   *       //   { message: "Field 'not_a_field' doesn't exist on type 'Product'" }
   *       // ] } }
   *       return json({ errors: error.body?.errors }, { status: 500 });
   *     }
   *     return json({ message: "An error occurred" }, { status: 500 });
   *   }
   * }
   * ```
   *
   * ```ts
   * // /app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   // ...
   * });
   * export default shopify;
   * export const unauthenticated = shopify.unauthenticated;
   * ```
   */
  storefront: StorefrontContext;
}

export type GetUnauthenticatedStorefrontContext = (
  shop: string,
) => Promise<UnauthenticatedStorefrontContext>;
