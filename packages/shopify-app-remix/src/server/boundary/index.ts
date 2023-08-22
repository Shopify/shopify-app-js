import {headersBoundary} from './headers';
import {errorBoundary} from './error';

/**
 * A collection of functions that handle the necessary code for error boundaries in routes using authenticate.admin.
 */
export const boundary = {
  /**
   * A function that handles errors or thrown responses.
   *
   * @example
   * Catching errors in a route
   * ```ts
   * // app/routes/admin/widgets.ts
   * import { boundary } from "@shopify/shopify-app-remix";
   *
   * export function ErrorBoundary() {
   *   return boundary.error(useRouteError());
   * }
   * ```
   */
  error: errorBoundary,

  /**
   * A function that sets the appropriate document repsonse headers.
   *
   * @example
   * Catching errors in a route
   * ```ts
   * // app/routes/admin/widgets.ts
   * import { boundary } from "@shopify/shopify-app-remix";
   *
   * export const headers = (headersArgs) => {
   *   return boundary.headers(headersArgs);
   * };
   * ```
   */
  headers: headersBoundary,
};
