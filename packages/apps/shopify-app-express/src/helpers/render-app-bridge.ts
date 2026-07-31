import {Request, Response} from 'express';
import {Shopify} from '@shopify/shopify-api';

import {APP_BRIDGE_URL} from '../const';
import {addCSPHeader} from '../middlewares/csp-headers';

let appBridgeUrlOverride: string | undefined;
export function setAppBridgeUrlOverride(url: string) {
  appBridgeUrlOverride = url;
}
function appBridgeUrl() {
  // eslint-disable-next-line no-process-env
  return appBridgeUrlOverride || process.env.APP_BRIDGE_URL || APP_BRIDGE_URL;
}

/**
 * Serves the App Bridge bootstrap shim for a document (page load) request.
 *
 * App Bridge loads in the browser, obtains a fresh session token, and reloads
 * the page with it attached. This is how an embedded document request that is
 * missing or has a stale session token recovers, without a top-level OAuth
 * redirect. Mirrors `renderAppBridge` in the React Router package.
 */
export function renderAppBridge(
  api: Shopify,
  req: Request,
  res: Response,
  redirectTo?: string,
): void {
  addCSPHeader(api, req, res);

  const redirectToScript = redirectTo
    ? `<script>window.open(${JSON.stringify(redirectTo)}, '_top')</script>`
    : '';

  res.status(200).set('content-type', 'text/html;charset=utf-8').send(`
      <script data-api-key="${api.config.apiKey}" src="${appBridgeUrl()}"></script>
      ${redirectToScript}
    `);
}
