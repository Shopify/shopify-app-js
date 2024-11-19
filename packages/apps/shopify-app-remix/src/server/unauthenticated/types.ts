import type {ShopifyRestResources} from '@shopify/shopify-api';

import type {AppConfigArg} from '../config-types';

import type {GetUnauthenticatedAdminContext} from './admin/types';
import type {GetUnauthenticatedStorefrontContext} from './storefront/types';

export interface Unauthenticated<
  ConfigArg extends AppConfigArg,
  Resources extends ShopifyRestResources,
> {
  /**
   * Get an admin context by passing a shop
   *
   * **Warning** This should only be used for Requests that do not originate from Shopify.
   * You must do your own authentication before using this method.
   * This method throws an error if there is no session for the shop.
   *
   * @example
   * <caption>Responding to a request not controlled by Shopify.</caption>
   * ```ts
   * // /app/shopify.server.ts
   * import { LATEST_API_VERSION, shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   * });
   * export default shopify;
   * ```
   * ```ts
   * // /app/routes/**\/*.jsx
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticateExternal } from "~/helpers/authenticate"
   * import shopify from "../../shopify.server";
   *
   * export async function loader({ request }: LoaderFunctionArgs) {
   *   const shop = await authenticateExternal(request)
   *   const {admin} = await shopify.unauthenticated.admin(shop);
   *   const response = await admin.graphql("{ shop { name} }")
   *
   *   return json(await response.json());
   * }
   * ```
   */
  admin: GetUnauthenticatedAdminContext<ConfigArg, Resources>;

  /**
   * Get a storefront context by passing a shop
   *
   * **Warning** This should only be used for Requests that do not originate from Shopify.
   * You must do your own authentication before using this method.
   * This method throws an error if there is no session for the shop.
   *
   * @example
   * <caption>Responding to a request not controlled by Shopify</caption>
   * ```ts
   * // /app/routes/**\/*.jsx
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticateExternal } from "~/helpers/authenticate"
   * import shopify from "../../shopify.server";
   *
   * export async function loader({ request }: LoaderFunctionArgs) {
   *   const shop = await authenticateExternal(request)
   *   const {storefront} = await shopify.unauthenticated.storefront(shop);
   *   const response = await storefront.graphql(`{blogs(first: 10) { edges { node { id } } } }`);
   *
   *   return json(await response.json());
   * }
   * ```
   */
  storefront: GetUnauthenticatedStorefrontContext;
}
