/**
 * The Scopes API enables embedded apps and extensions to request merchant consent for access scopes.
 */
export interface ScopesApiContext {
  /**
   * Queries Shopify to see what scopes have been granted
   *
   * @returns {ScopesDetail} The scope details.
   *
   * @example
   * <caption>Query for granted scopes.</caption>
   * <description>Call `scopes.query` to get scope details.</description>
   * ```ts
   * // /app._index.tsx
   * import { authenticate } from "../shopify.server";
   * import { json } from "@remix-run/node";
   *
   * export const loader = async ({ request }) => {
   *   const { scopes } = await authenticate.admin(request);
   *   const { required, optional, granted } = await scopes.query();
   *
   *   if (granted.includes("write_products")) {
   *     // do something
   *   }
   *
   *   return null
   * };
   *
   * ```
   */
  query: () => Promise<ScopesDetail>;

  /**
   * Requests the merchant grant the provided scopes
   *
   * This method performs a redirect to the grant screen.
   *
   * @example
   * <caption>Ask the merchant to grant the provided scopes.</caption>
   * <description>Call `scopes.request` to request optional scopes.</description>
   * ```ts
   * // /app/routes/app.request.tsx
   * import { authenticate } from "../shopify.server";
   *
   * // Example of an action to request optional scopes
   * export const action = async ({ request }) => {
   *   const { scopes } = await authenticate.admin(request);
   *   const { granted } = await scopes.query();
   *
   *   if (!granted.includes("write_products")) {
   *     await scopes.request(["write_products"]);
   *   }
   *
   *   return null
   * };
   * ```
   */
  request: (scopes: Scope[]) => Promise<void>;

  /**
   * Revokes the provided scopes
   *
   * Warning: This method throws an [error](https://shopify.dev/docs/api/admin-graphql/unstable/objects/AppRevokeAccessScopesAppRevokeScopeError) if the provided optional scopes contains a required scope.
   *
   * @example
   * <caption>Revoke optional scopes.</caption>
   * <description>Call `scopes.revoke` to revoke optional scopes.</description>
   * ```ts
   * // /app._index.tsx
   * import { authenticate } from "../shopify.server";
   * import { json } from "@remix-run/node";
   *
   * // Example of an action to POST optional scopes to revoke
   * export const action = async ({ request }) => {
   *   const { scopes } = await authenticate.admin(request);
   *   const { granted } = await scopes.query();
   *
   *   if (granted.includes("write_products")) {
   *     const revokedResponse = await scopes.revoke(["write_products"]);
   *     return json(revokedResponse);
   *   }
   *
   *   return null
   * };
   *
   * ```
   */
  revoke: (scopes: Scope[]) => Promise<ScopesRevokeResponse>;
}

/**
 * `Scope` represents an [access scope](https://shopify.dev/docs/api/usage/access-scopes) handle, like "`write_products`" or "`read_orders`"
 */
export type Scope = string;

/**
 * `UserResult` represents the results of a user responding to a scopes request, i.e. a merchant user’s action taken when presented with a grant modal.
 */
export type UserResult = 'granted-all' | 'declined-all';

export interface ScopesDetail {
  /**
   * The scopes that have been granted on the shop for this app
   */
  granted: Scope[];
  /**
   * The required scopes that the app has declared in its configuration
   */
  required: Scope[];
  /**
   * The optional scopes that the app has declared in its configuration
   */
  optional: Scope[];
}

export interface ScopesRequestResponse {
  result: UserResult;
  detail: ScopesDetail;
}

export interface ScopesRevokeResponse {
  /**
   * The scopes that have been revoked on the shop for this app
   */
  revoked: Scope[];
}
