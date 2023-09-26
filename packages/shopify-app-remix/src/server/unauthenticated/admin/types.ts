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
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { unauthenticated } from "../shopify.server";
   * import { getMyAppData } from "~/db/model.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   const shop = getShopFromExternalRequest(request);
   *   const { session } = await unauthenticated.admin(shop);
   *   return json(await getMyAppData({shop: session.shop));
   * };
   * ```
   */
  session: Session;

  /**
   * Methods for interacting with the GraphQL / REST Admin APIs for the given store.
   */
  admin: AdminApiContext<Resources>;
}

export type GetUnauthenticatedAdminContext<
  Resources extends ShopifyRestResources,
> = (shop: string) => Promise<UnauthenticatedAdminContext<Resources>>;
