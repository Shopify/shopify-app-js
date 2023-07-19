import type {BasicParams} from '../../types';
import {DEFAULT_CSP_VALUE} from '../const';

export function addDocumentResponseHeadersFactory(params: BasicParams) {
  const {api, config} = params;

  return function (request: Request, headers: Headers) {
    const {searchParams} = new URL(request.url);
    const shop = api.utils.sanitizeShop(searchParams.get('shop')!);

    addDocumentResponseHeaders(headers, config.isEmbeddedApp, shop);
  };
}

export function addDocumentResponseHeaders(
  headers: Headers,
  isEmbeddedApp: boolean,
  shop: string | null | undefined,
) {
  if (isEmbeddedApp && shop) {
    // Set or update the CSP with the shop subdomain instead of a wildcard:
    let csp = headers.get('Content-Security-Policy') || DEFAULT_CSP_VALUE;
    if (shop) csp = csp.replace('*.myshopify.com', shop);
    headers.set('Content-Security-Policy', csp);
  }
}
