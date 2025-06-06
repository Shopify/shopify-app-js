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
   * <caption>Query for granted scopes.</caption>
   * <description>Call `scopes.query` to get scope details.</description>
   * ```ts
   * // /app._index.tsx
   * import type { LoaderFunctionArgs } from "react-router";
   * import { useLoaderData } from "react-router";
   * import { authenticate } from "../shopify.server";
   * import { json } from "react-router";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { scopes } = await authenticate.admin(request);
   *
   *   const scopesDetail =  await scopes.query();
   *
   *   return ({
   *     hasWriteProducts: scopesDetail.granted.includes('write_products'),
   *   });
   * };
   *
   * export default function Index() {
   *   const {hasWriteProducts} = useLoaderData<typeof loader>();
   *
   *   ...
   * }
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
   * import type { ActionFunctionArgs } from "react-router";
   * import { useFetcher } from "react-router";
   * import { authenticate } from "../shopify.server";
   * import { json } from "react-router";
   *
   * // Example of an action to POST a request to for optional scopes
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { scopes } = await authenticate.admin(request);
   *
   *   const body = await request.formData();
   *   const scopesToRequest = body.getAll("scopes") as string[];
   *
   *   // If the scopes are not already granted, a full page redirect to the request URL occurs
   *   await scopes.request(scopesToRequest);
   *   // otherwise return an empty response
   *   return ({});
   * };
   *
   * export default function Index() {
   *   const fetcher = useFetcher<typeof action>();
   *
   *   const handleRequest = () => {
   *     fetcher.submit({scopes: ["write_products"]}, {
   *       method: "POST",
   *     });
   *   };
   *
   *   ...
   * }
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
   * import type { ActionFunctionArgs } from "react-router";
   * import { useFetcher } from "react-router";
   * import { authenticate } from "../shopify.server";
   * import { json } from "react-router";
   *
   * // Example of an action to POST optional scopes to revoke
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { scopes } = await authenticate.admin(request);
   *
   *   const body = await request.formData();
   *   const scopesToRevoke = body.getAll("scopes") as string[];
   *
   *   const revokedResponse = await scopes.revoke(scopesToRevoke);
   *
   *   return (revokedResponse);
   * };
   *
   * export default function Index() {
   *   const fetcher = useFetcher<typeof action>();
   *
   *   const handleRevoke = () => {
   *     fetcher.submit({scopes: ["write_products"]}, {
   *       method: "POST",
   *     });
   *   };
   *
   *   ...
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
