import type {AuthenticateCheckout} from './checkout/types';
import type {AuthenticateAppProxy} from './appProxy/types';
import type {AuthenticateCustomerAccount} from './customer-account/types';

export interface AuthenticatePublic {
  /**
   * Authenticate a request from a checkout extension
   *
   * @example
   * <caption>Authenticating a checkout extension request</caption>
   * ```ts
   * // /app/routes/public/widgets.ts
   * import { LoaderFunctionArgs, json } from "react-router";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { sessionToken, cors } = await authenticate.public.checkout(
   *     request,
   *   );
   *   return cors({my: "data", shop: sessionToken.dest}));
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
   * import { LoaderFunctionArgs, json } from "react-router";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   await authenticate.public.appProxy(
   *     request,
   *   );
   *
   *   const {searchParams} = new URL(request.url);
   *   const shop = searchParams.get("shop");
   *   const customerId = searchParams.get("logged_in_customer_id")
   *
   *   return ({my: "data", shop, customerId});
   * };
   * ```
   */
  appProxy: AuthenticateAppProxy;

  /**
   * Authenticate a request from a customer account extension
   *
   * @example
   * <caption>Authenticating a customer account extension request</caption>
   * ```ts
   * // /app/routes/public/widgets.ts
   * import { LoaderFunctionArgs, json } from "react-router";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { sessionToken, cors } = await authenticate.public.customerAccount(
   *     request,
   *   );
   *   return cors({my: "data", shop: sessionToken.dest}));
   * };
   * ```
   */
  customerAccount: AuthenticateCustomerAccount;
}
