import {Session, ShopifyRestResources} from '@shopify/shopify-api';

import type {AdminApiContext} from '../../config-types';

export interface UnauthenticatedAdminContext<
  Resources extends ShopifyRestResources,
> {
  /**
   * The session for the given shop.
   *
   * This comes from the session storage which `shopifyApp` uses to store sessions in your database of choice.
   *
   * This will always be an offline session. You can use to get shop specific data.
   *
   * @example
   * Getting your app's shop specific widget data using a session
   * ```ts
   * // app/routes/**\/.ts
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { unauthenticated } from "../shopify.server";
   * import { getWidgets } from "~/db/widgets.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   const shop = getShopFromExternalRequest(request);
   *   const { session } = await unauthenticated.admin(shop);
   *   return json(await getWidgets({shop: session.shop));
   * };
   * ```
   */
  session: Session;

  /**
   * Methods for interacting with the Shopify GraphQL / REST Admin APIs for the given store.
   */
  admin: AdminApiContext<Resources>;
}
