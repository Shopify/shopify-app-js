import type {BasicParams} from '../../types';
import {AppDistribution} from '../../types';

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

    const isEmbeddedApp = config.distribution !== AppDistribution.ShopifyAdmin;
    addDocumentResponseHeaders(headers, isEmbeddedApp, shop);
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
        `frame-ancestors https://${shop} https://admin.shopify.com https://*.spin.dev https://admin.myshopify.io https://admin.shop.dev;`,
      );
    }
  } else {
    headers.set('Content-Security-Policy', `frame-ancestors 'none';`);
  }
}
