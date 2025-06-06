import type {AppConfigArg} from '../../config-types';

import type {AuthenticateCheckout} from './checkout/types';
import type {AuthenticateAppProxy} from './appProxy/types';
import type {AuthenticateCustomerAccount} from './customer-account/types';
import type {AuthenticatePOS} from './pos/types';

// Eventually this will be just the `{}` bit without `AuthenticateCheckout &`
// We have this is because in v1 public WAS the only public authenticate method
// But it became tightly coupled to authenticating Checkout requests.
// In V2 you will have only public.checkout() and public.appProxy(), no public()

export interface AuthenticatePublic<Config extends AppConfigArg> {
  /**
   * Authenticate a request from a checkout extension
   *
   * @example
   * <caption>Authenticating a checkout extension request</caption>
   * ```ts
   * // /app/routes/public/widgets.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
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
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
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
   *   return json({my: "data", shop, customerId});
   * };
   * ```
   */
  appProxy: AuthenticateAppProxy<Config>;

  /**
   * Authenticate a request from a customer account extension
   *
   * @example
   * <caption>Authenticating a customer account extension request</caption>
   * ```ts
   * // /app/routes/public/widgets.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { sessionToken, cors } = await authenticate.public.customerAccount(
   *     request,
   *   );
   *   return cors(json({my: "data", shop: sessionToken.dest}));
   * };
   * ```
   */
  customerAccount: AuthenticateCustomerAccount;

  /**
   * Authenticate a request from a POS UI extension
   *
   * @example
   * <caption>Authenticating a POS UI extension request</caption>
   * ```ts
   * // /app/routes/public/widgets.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { sessionToken, cors } = await authenticate.public.pos(
   *     request,
   *   );
   *   return cors(json({my: "data", shop: sessionToken.dest}));
   * };
   * ```
   */
  pos: AuthenticatePOS;
}
