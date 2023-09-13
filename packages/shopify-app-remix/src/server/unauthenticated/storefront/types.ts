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
   * <caption>Getting shop specific data using a session</caption>
   * ```ts
   * // app/routes/**\/.ts
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { unauthenticated } from "../shopify.server";
   * import { getWidgets } from "~/db/widgets.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   const shop = getShopFromExternalRequest(request);
   *   const { session } = await unauthenticated.storefront(shop);
   *   return json(await getWidgets({shop: session.shop));
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
