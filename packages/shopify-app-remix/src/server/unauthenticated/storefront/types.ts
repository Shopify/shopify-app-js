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
   */
  storefront: StorefrontContext;
}

export type GetUnauthenticatedStorefrontContext = (
  shop: string,
) => Promise<UnauthenticatedStorefrontContext>;
