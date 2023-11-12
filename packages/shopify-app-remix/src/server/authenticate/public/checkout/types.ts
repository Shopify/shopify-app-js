import {JwtPayload} from '@shopify/shopify-api';

import {EnsureCORSFunction} from '../../helpers/ensure-cors-headers';

export type AuthenticateCheckout = (
  request: Request,
  options?: AuthenticateCheckoutOptions,
) => Promise<CheckoutContext>;

export interface AuthenticateCheckoutOptions {
  corsHeaders?: string[];
}

/**
 * Authenticated Context for a checkout request
 */
export interface CheckoutContext {
  /**
   * The decoded and validated session token for the request
   *
   * Refer to the OAuth docs for the [session token payload](https://shopify.dev/docs/apps/auth/oauth/session-tokens#payload).
   *
   * @example
   * <caption>Using the decoded session token.</caption>
   * <description>Get store-specific data using the `sessionToken` object.</description>
   * ```ts
   * // app/routes/public/my-route.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import { getMyAppData } from "~/db/model.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { sessionToken } = await authenticate.public.checkout(
   *     request
   *   );
   *   return json(await getMyAppData({shop: sessionToken.dest}));
   * };
   * ```
   */
  sessionToken: JwtPayload;

  /**
   * A function that ensures the CORS headers are set correctly for the response.
   *
   * @example
   * <caption>Setting CORS headers for a public request.</caption>
   * <description>Use the `cors` helper to ensure your app can respond to checkout extension requests.</description>
   * ```ts
   * // app/routes/public/my-route.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import { getMyAppData } from "~/db/model.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { sessionToken, cors } = await authenticate.public.checkout(
   *     request,
   *     { corsHeaders: ["X-My-Custom-Header"] }
   *   );
   *   const data = await getMyAppData({shop: sessionToken.dest});
   *   return cors(json(data));
   * };
   * ```
   */
  cors: EnsureCORSFunction;
}
