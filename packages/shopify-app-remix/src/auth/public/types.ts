import {JwtPayload} from '@shopify/shopify-api';

import {EnsureCORSFunction} from '../helpers/ensure-cors-headers';

export interface AuthenticatePublicOptions {
  corsHeaders?: string[];
}

/**
 * Authenticated Context for a public request
 */
export interface PublicContext {
  /**
   * The decoded and validated session token for the request
   *
   * The payload of the Session Token is described here: {@link https://shopify.dev/docs/apps/auth/oauth/session-tokens#payload}
   *
   * @example
   * Getting your app's store specific widget data using the session token
   * ```ts
   * // app/routes/public/widgets.ts
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import { getWidgets } from "~/db/widgets.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   const { sessionToken } = await authenticate.public(
   *     request
   *   );
   *   return json(await getWidgets({shop: sessionToken.dest}));
   * };
   * ```
   */
  sessionToken: JwtPayload;

  /**
   * A function that ensures the CORS headers are set correctly for the response
   *
   * @example
   * Setting CORS headers for a public request
   * ```ts
   * // app/routes/public/widgets.ts
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import { getWidgets } from "~/db/widgets.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   const { sessionToken, cors } = await authenticate.public(
   *     request,
   *     { corsHeaders: ["X-My-Custom-Header"] }
   *   );
   *   const widgets = await getWidgets({shop: sessionToken.dest});
   *   return cors(json(widgets));
   * };
   * ```
   */
  cors: EnsureCORSFunction;
}
