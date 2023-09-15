import {Session, ShopifyRestResources} from '@shopify/shopify-api';

import {AdminApiContext} from '../../../config-types';

export type AuthenticateAppProxy = (
  request: Request,
) => Promise<AppProxyContext | AppProxyContextWithSession>;

interface Options {
  layout?: boolean;
}

export type LiquidResponseFunction = (
  body: string,
  initAndOptions?: number | (ResponseInit & Options),
) => Response;

interface Context {
  /**
   * A utility for creating a Liquid Response.
   *
   * @example
   * <caption>Returning a Liquid Response from an app proxy route</caption>
   * ```ts
   * // app/routes/**\/.ts
   * import {authenticate} from "~/shopify.server"
   *
   * export async function loader({ request }) {
   *   const {liquid} = authenticate.public.appProxy(request);
   *
   *   return liquid("Hello {{shop.name}}")
   * }
   *
   * ```
   */
  liquid: LiquidResponseFunction;
}

export interface AppProxyContext extends Context {
  /**
   * No session is available for the shop that made this request.
   *
   * This comes from the session storage which `shopifyApp` uses to store sessions in your database of choice.
   */
  session: undefined;

  /**
   * No session is available for the shop that made this request.
   * Therefore no methods for interacting with the GraphQL / REST Admin APIs are available.
   */
  admin: undefined;
}

export interface AppProxyContextWithSession<
  Resources extends ShopifyRestResources = ShopifyRestResources,
> extends Context {
  /**
   * The session for the shop that made the request.
   *
   * This comes from the session storage which `shopifyApp` uses to store sessions in your database of choice.
   *
   * Use this to get shop or user-specific data.
   *
   * @example
   * <caption>Getting your app's shop specific widget data using an offline session</caption>
   * ```ts
   * // app/routes/**\/.ts
   * import { json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import { getWidgets } from "~/db/widgets.server";
   *
   * export const loader = async ({ request }) => {
   *   const { session } = await authenticate.public.appProxy(request);
   *   return json(await getWidgets({shop: session.shop));
   * };
   * ```
   */
  session: Session;

  /**
   * Methods for interacting with the GraphQL / REST Admin APIs for the store that made the request.
   */
  admin: AdminApiContext<Resources>;
}
