import {Session, ShopifyRestResources} from '@shopify/shopify-api';

import {AdminApiContext} from '../../../config-types';

export type AuthenticateAppProxy<Resources extends ShopifyRestResources> = (
  request: Request,
) => Promise<AppProxyContext<Resources>>;

export interface AppProxyContext<Resources extends ShopifyRestResources> {
  /**
   * Methods for interacting with the Shopify GraphQL / REST Admin APIs for the store that made the request
   */
  admin: AdminApiContext<Resources>;

  /**
   * The session for the user who made the request.
   *
   * This comes from the session storage which `shopifyApp` uses to store sessions in your database of choice.
   *
   * Use this to get shop or user specific data.
   *
   * @example
   * Getting your app's shop specific widget data using an offline session
   * ```ts
   * // app/routes/**\/.ts
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import { getWidgets } from "~/db/widgets.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   const { session } = await authenticate.admin(request);
   *   return json(await getWidgets({shop: session.shop));
   * };
   * ```
   *
   * @example
   * Getting your app's user specific widget data using an online session
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   useOnlineTokens: true,
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   *
   * // app/routes/**\/.ts
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import { getWidgets } from "~/db/widgets.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   const { session } = await authenticate.admin(request);
   *   return json(await getWidgets({user: session.onlineAccessInfo!.id}));
   * };
   * ```
   */
  session: Session;
}
