import type {AuthenticateCheckout} from './checkout/types';
import type {AuthenticateAppProxy} from './appProxy/types';

// Eventually this will be just the `{}` bit without `AuthenticateCheckout &`
// We have this is because in v1 public WAS the only public authenticate method
// But it became tightly coupled to authentictaing Checkout requests.
// In V2 you will have only public.checkout() and public.appProxy(), no public()

/**
 * Methods for authenticating Requests from Shopify's public surfaces
 *
 * To maintain backwards compatability this is a function and an object.
 *
 * Do not use `authenticate.public()`. Use `authenticate.public.checkout()` instead.
 * `authenticate.public()` will be removed in v2.
 *
 * Methods are:
 *
 * - `authenticate.public.checkout()` for authenticating requests from checkout extensions
 * - `authenticate.public.appProxy()` for authenticating requests from app proxies
 */
export type AuthenticatePublic = AuthenticateCheckout & {
  /**
   * Authenticate a request from a checkout extension
   *
   * @example
   * <caption>Authenticating a checkout extension request</caption>
   * ```ts
   * // /app/routes/public/widgets.ts
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   const { sessionToken, cors } = await authenticate.public.checkout(
   *     request,
   *   );
   *   return cors(json({my: "data", shop: sessionToken.dest}));
   * };
   * ```
   */
  checkout: AuthenticateCheckout;

  /**
   * Authenticate a request from an app proxy
   *
   * @example
   * <caption>Authenticating an app proxy request</caption>
   * ```ts
   * // /app/routes/public/widgets.ts
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   await authenticate.public.appProxy(
   *     request,
   *   );
   *
   *   const {searchParams} = new URL(request.url);
   *   const shop = searchParams.get("shop");
   *   const customerId = searchParams.get("logged_in_customer_id")
   *
   *   return json({my: "data", shop, customerId});
   * };
   * ```
   */
  appProxy: AuthenticateAppProxy;
};
