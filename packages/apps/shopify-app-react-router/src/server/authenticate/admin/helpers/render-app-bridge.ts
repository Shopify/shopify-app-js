import {BasicParams, AppDistribution} from '../../../types';
import {appBridgeUrl} from '../../helpers/app-bridge-url';
import {addDocumentResponseHeaders} from '../../helpers/add-response-headers';

import {sanitizeRedirectUrl} from './validate-redirect-url';

import type {RedirectTarget} from '.';

export interface RedirectToOptions {
  url: string | URL;
  target?: RedirectTarget;
}

export function renderAppBridge(
  {api, config}: BasicParams,
  request: Request,
  redirectTo?: RedirectToOptions,
): never {
  let redirectToScript = '';
  if (redirectTo) {
    const destination = sanitizeRedirectUrl(config.appUrl, redirectTo.url);

    const target = redirectTo.target ?? '_top';

    redirectToScript = `<script>window.open(${JSON.stringify(
      destination.toString(),
    )}, ${JSON.stringify(target)})</script>`;
  }

  const responseHeaders = new Headers({
    'content-type': 'text/html;charset=utf-8',
  });
  const isEmbeddedApp = config.distribution !== AppDistribution.ShopifyAdmin;
  // Sanitize the shop param before using it in response headers (e.g. CSP
  // frame-ancestors, Link preconnect). An attacker-controlled `?shop=evil.com`
  // must not end up in security-sensitive headers.
  const shop = api.utils.sanitizeShop(
    new URL(request.url).searchParams.get('shop')!,
  );
  addDocumentResponseHeaders(responseHeaders, isEmbeddedApp, shop);

  throw new Response(
    `
      <script data-api-key="${config.apiKey}" src="${appBridgeUrl()}"></script>
      ${redirectToScript}
    `,
    {headers: responseHeaders},
  );
}
