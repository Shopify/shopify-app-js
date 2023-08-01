import {BasicParams} from '../../types';

import type {RedirectTarget} from './redirect';
import {appBridgeUrl} from './app-bridge-url';
import {addDocumentResponseHeaders} from './add-response-headers';

export interface RedirectToOptions {
  url: string | URL;
  target?: RedirectTarget;
}

export function renderAppBridge(
  {config}: BasicParams,
  request: Request,
  redirectTo?: RedirectToOptions,
): never {
  let redirectToScript = '';
  if (redirectTo) {
    const destination = new URL(redirectTo.url, config.appUrl);
    const target = redirectTo.target ?? '_top';

    redirectToScript = `<script>window.open(${JSON.stringify(
      destination.toString(),
    )}, ${JSON.stringify(target)})</script>`;
  }

  const responseHeaders = new Headers({
    'content-type': 'text/html;charset=utf-8',
  });
  addDocumentResponseHeaders(
    responseHeaders,
    config.isEmbeddedApp,
    new URL(request.url).searchParams.get('shop'),
  );

  throw new Response(
    `
      <script data-api-key="${config.apiKey}" src="${appBridgeUrl()}"></script>
      ${redirectToScript}
    `,
    {headers: responseHeaders},
  );
}
