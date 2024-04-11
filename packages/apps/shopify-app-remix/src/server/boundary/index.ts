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
   * <caption>Catching errors in a route</caption>
   * ```ts
   * // /app/routes/admin/widgets.ts
   * import { boundary } from "@shopify/shopify-app-remix/server";
   *
   * export function ErrorBoundary() {
   *   return boundary.error(useRouteError());
   * }
   * ```
   */
  error: errorBoundary,

  /**
   * A function that sets the appropriate document response headers.
   *
   * @example
   * <caption>Catching errors in a route</caption>
   * ```ts
   * // /app/routes/admin/widgets.ts
   * import { boundary } from "@shopify/shopify-app-remix/server";
   *
   * export const headers = (headersArgs) => {
   *   return boundary.headers(headersArgs);
   * };
   * ```
   */
  headers: headersBoundary,
};
