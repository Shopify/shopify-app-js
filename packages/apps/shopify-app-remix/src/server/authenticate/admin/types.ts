import {JwtPayload, Session, ShopifyRestResources} from '@shopify/shopify-api';

import {EnsureCORSFunction} from '../helpers/ensure-cors-headers';
import type {AppConfigArg} from '../../config-types';
import type {AdminApiContext} from '../../clients';
import {FeatureEnabled} from '../../future/flags';

import type {BillingContext} from './billing/types';
import {RedirectFunction} from './helpers/redirect';
import {ScopesApiContext} from './scope/types';

interface AdminContextInternal<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
> {
  /**
   * The session for the user who made the request.
   *
   * This comes from the session storage which `shopifyApp` uses to store sessions in your database of choice.
   *
   * Use this to get shop or user-specific data.
   *
   * @example
   * <caption>Using offline sessions.</caption>
   * <description>Get your app's shop-specific data using an offline session.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import { getMyAppData } from "~/db/model.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { session } = await authenticate.admin(request);
   *   return json(await getMyAppData({shop: session.shop));
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   *
   * @example
   * <caption>Using online sessions.</caption>
   * <description>Get your app's user-specific data using an online session.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import { getMyAppData } from "~/db/model.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { session } = await authenticate.admin(request);
   *   return json(await getMyAppData({user: session.onlineAccessInfo!.id}));
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   useOnlineTokens: true,
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  session: Session;

  /**
   * Methods for interacting with the GraphQL / REST Admin APIs for the store that made the request.
   */
  admin: AdminApiContext<Resources>;

  /**
   * Billing methods for this store, based on the plans defined in the `billing` config option.
   *
   * {@link https://shopify.dev/docs/apps/billing}
   */
  billing: BillingContext<Config>;

  /**
   * A function that ensures the CORS headers are set correctly for the response.
   *
   * @example
   * <caption>Setting CORS headers for a admin request.</caption>
   * <description>Use the `cors` helper to ensure your app can respond to requests from admin extensions.</description>
   * ```ts
   * // /app/routes/admin/my-route.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import { getMyAppData } from "~/db/model.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { session, cors } = await authenticate.admin(request);
   *   return cors(json(await getMyAppData({user: session.onlineAccessInfo!.id})));
   * };
   * ```
   */
  cors: EnsureCORSFunction;
}

export interface EmbeddedAdminContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
> extends AdminContextInternal<Config, Resources> {
  /**
   * The decoded and validated session token for the request.
   *
   * Returned only if `isEmbeddedApp` is `true`.
   *
   * {@link https://shopify.dev/docs/apps/auth/oauth/session-tokens#payload}
   *
   * @example
   * <caption>Using the decoded session token.</caption>
   * <description>Get user-specific data using the `sessionToken` object.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import { getMyAppData } from "~/db/model.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { sessionToken } = await authenticate.admin(
   *     request
   *   );
   *   return json(await getMyAppData({user: sessionToken.sub}));
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   useOnlineTokens: true,
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  sessionToken: JwtPayload;

  /**
   * A function that redirects the user to a new page, ensuring that the appropriate parameters are set for embedded
   * apps.
   *
   * Returned only if `isEmbeddedApp` is `true`.
   *
   * @example
   * <caption>Redirecting to an app route.</caption>
   * <description>Use the `redirect` helper to safely redirect between pages.</description>
   * ```ts
   * // /app/routes/admin/my-route.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { session, redirect } = await authenticate.admin(request);
   *   return redirect("/");
   * };
   * ```
   *
   * @example
   * <caption>Redirecting outside of the Admin embedded app page.</caption>
   * <description>Pass in a `target` option of `_top` or `_parent` to navigate in the current window, or `_blank` to open a new tab.</description>
   * ```ts
   * // /app/routes/admin/my-route.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { session, redirect } = await authenticate.admin(request);
   *   return redirect("/", { target: '_parent' });
   * };
   * ```
   */
  redirect: RedirectFunction;
}
export interface NonEmbeddedAdminContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
> extends AdminContextInternal<Config, Resources> {}

type EmbeddedTypedAdminContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
> = Config['isEmbeddedApp'] extends false
  ? NonEmbeddedAdminContext<Config, Resources>
  : EmbeddedAdminContext<Config, Resources>;

export interface ScopesContext {
  /**
   * Methods to manage optional scopes for the store that made the request.
   */
  scopes: ScopesApiContext;
}

export type AdminContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources,
> =
  FeatureEnabled<Config['future'], 'wip_optionalScopesApi'> extends true
    ? EmbeddedTypedAdminContext<Config, Resources> & ScopesContext
    : EmbeddedTypedAdminContext<Config, Resources>;

export type AuthenticateAdmin<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
> = (request: Request) => Promise<AdminContext<Config, Resources>>;
