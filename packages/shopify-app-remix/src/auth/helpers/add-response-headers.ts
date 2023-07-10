import type {BasicParams} from '../../types';
import {
  APP_BRIDGE_HEADERS,
  APP_BRIDGE_NEXT_URL,
  DEFAULT_CSP_VALUE,
} from '../const';

const ORIGINAL_HEADERS = Symbol.for('originalHeaders');

export function addResponseHeadersFactory(params: BasicParams) {
  const {api, config} = params;

  return function (request: Request, headers: Headers) {
    const {searchParams} = new URL(request.url);
    const shop = api.utils.sanitizeShop(searchParams.get('shop')!);

    addResponseHeaders(headers, config.isEmbeddedApp, shop);
  };
}

export function addResponseHeaders(
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

export function installGlobalResponseHeaders(isEmbeddedApp: boolean) {
  const headersDescriptor =
    Object.getOwnPropertyDescriptor(Response.prototype, ORIGINAL_HEADERS) ||
    Object.getOwnPropertyDescriptor(Response.prototype, 'headers')!;

  // Store the original Response.prototype.headers descriptor so we can use it when live-reloading the server:
  Object.defineProperty(
    Response.prototype,
    ORIGINAL_HEADERS,
    headersDescriptor,
  );

  // Overwrite the Response.prototype.headers getter with one that injects our global headers:
  Object.defineProperty(Response.prototype, 'headers', {
    ...headersDescriptor,
    get() {
      // Note: this is not an empty Headers, it will contain any headers passed to new Response():
      const headers = headersDescriptor.get!.call(this);

      try {
        // Inject CORS headers required by both Embedded Apps and UI Extensions:
        if (isEmbeddedApp) {
          for (const key in APP_BRIDGE_HEADERS) {
            if (!headers.get(key)) {
              const value =
                APP_BRIDGE_HEADERS[key as keyof typeof APP_BRIDGE_HEADERS];

              headers.set(key, value);
            }
          }
        }

        // Apply a default CSP unless a more specific one (no wildcard) is present:
        if (!headers.get('Content-Security-Policy')) {
          headers.set(
            'Content-Security-Policy',
            isEmbeddedApp ? DEFAULT_CSP_VALUE : `frame-ancestors 'none';`,
          );
        }

        if (!headers.get('Link')) {
          headers.set('Link', `<${APP_BRIDGE_NEXT_URL}>; rel="preload"`);
        }
      } catch (err) {
        // Do nothing, this is not a standard Response object.
      }

      return headers;
    },
  });
}
