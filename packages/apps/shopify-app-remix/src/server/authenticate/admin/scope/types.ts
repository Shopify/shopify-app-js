/**
 * The Scopes API enables embedded apps and extensions to request merchant consent for access scopes.
 */
export interface ScopesApiContext {
  /**
   * Queries Shopify for the scopes for this app on this shop
   *
   * @returns {ScopesDetail} The scope details.
   *
   * @example
   * <caption>Query for scopes details.</caption>
   * <description>Call `scopes.query` to get scope details.</description>
   * ```ts
   * // /app._index.tsx
   *import type { LoaderFunctionArgs } from "@remix-run/node";
   *import { json } from "@remix-run/node";
   *import { authenticate } from "../shopify.server";
   *
   *export async function loader({
   *  request,
   *}: LoaderFunctionArgs) {
   *  const { scopes } = await authenticate.admin(request);
   *
   *  const response = await scopes.query();
   *  return json({scopesDetail : response});
   *}
   *
   *export default function Index() {
   *  const {scopesDetail} = useLoaderData<typeof loader>();
   *  ...
   *}
   * ```
   */
  query: () => Promise<ScopesDetail>;

  /**
   * Requests the merchant to grant the provided scopes for this app on this shop
   *
   * Warning: This method performs a server-side redirect.
   *
   * @example
   * <caption>Request consent from the merchant to grant the provided scopes for this app.</caption>
   * <description>Call `scopes.request` to request optional scopes.</description>
   * ```ts
   * // /app/routes/app.request.tsx
   *import type { ActionFunctionArgs } from "@remix-run/node";
   *import { json } from "@remix-run/node";
   *
   *import { authenticate } from "../shopify.server";
   *import { AuthScopes } from "@shopify/shopify-api";
   *export async function action({
   *  request,
   *}: ActionFunctionArgs) {
   *  const { scopes } = await authenticate.admin(request);
   *
   *  const body = await request.formData();
   *  const optionalScopesData = body.getAll("scopes") as string[];
   *  const optionalScopes = new AuthScopes(optionalScopesData);
   *
   *  // Full Page Redirect to grant requested scopes
   *  await scopes.request(optionalScopes.toArray());
   *
   *  // if there are no newly requested scopes to grant, return
   *  return json({});
   *}
   * ```
   */
  request: (scopes: Scope[]) => Promise<void>;

  /**
   * Revokes the provided scopes from this app on this shop
   *
   * Warning: This method throws an [error](https://shopify.dev/docs/api/admin-graphql/unstable/objects/AppRevokeAccessScopesAppRevokeScopeError) if the provided optional scopes contains a required scope.
   *
   * @example
   * <caption>Revoke optional scopes.</caption>
   * <description>Call `scopes.revoke` to revoke optional scopes.</description>
   * ```ts
   * // /app._index.tsx
   *import type { ActionFunctionArgs } from "@remix-run/node";
   *import { json } from "@remix-run/node";
   *import { authenticate } from "../shopify.server";
   *import { AuthScopes } from "@shopify/shopify-api";
   *import { useActionData } from "@remix-run/react";
   *
   *export async function action({
   *  request,
   *}: ActionFunctionArgs) {
   *  const { scopes } = await authenticate.admin(request);
   *
   *  const body = await request.formData();
   *  const scopesToRevokeData = body.getAll("scopes") as string[];
   *  const scopesToRevoke = new AuthScopes(scopesToRevokeData);
   *
   *  try {
   *    const revokedResponse = await scopes.revoke(scopesToRevoke.toArray());
   *    return json(revokedResponse);
   *  } 
   *  catch (e) {
   *    return json({});
   *  }
   *}
   *
   * export default function Index() {
   *  const {revokedResponse} = useActionData<typeof loader>();
   *  ...
   * }
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
