import type {BasicParams} from '../../types';

export type AddDocumentResponseHeadersFunction = (
  request: Request,
  headers: Headers,
) => void;

export function addDocumentResponseHeadersFactory(
  params: BasicParams,
): AddDocumentResponseHeadersFunction {
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
  if (shop) {
    headers.set(
      'Link',
      '<https://cdn.shopify.com/shopifycloud/app-bridge.js>; rel="preload"; as="script";',
    );
  }

  if (isEmbeddedApp) {
    if (shop) {
      headers.set(
        'Content-Security-Policy',
        `frame-ancestors https://${shop} https://admin.shopify.com https://*.spin.dev;`,
      );
    }
  } else {
    headers.set('Content-Security-Policy', `frame-ancestors 'none';`);
  }
}
