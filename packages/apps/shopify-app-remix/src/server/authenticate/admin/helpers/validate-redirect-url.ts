import {ShopifyError} from '@shopify/shopify-api';

interface Options {
  requireSSL?: boolean;
  throwOnInvalid?: boolean;
}

type SanitizedRedirectUrl<OptionsArg extends Options> =
  OptionsArg['throwOnInvalid'] extends false ? URL | undefined : URL;

const FILE_URI_MATCH = /\/\/\//;
const INVALID_RELATIVE_URL = /[/\\][/\\]/;
const WHITESPACE_CHARACTER = /\s/;
const VALID_PROTOCOLS = ['https:', 'http:'];

function isSafe(
  domain: string,
  redirectUrl: unknown,
  requireSSL: boolean | undefined = true,
): redirectUrl is string {
  if (typeof redirectUrl !== 'string') {
    return false;
  }

  if (
    FILE_URI_MATCH.test(redirectUrl) ||
    WHITESPACE_CHARACTER.test(redirectUrl)
  ) {
    return false;
  }

  let url: URL;

  try {
    url = new URL(redirectUrl, domain);
  } catch (_error) {
    return false;
  }

  if (INVALID_RELATIVE_URL.test(url.pathname)) {
    return false;
  }

  if (!VALID_PROTOCOLS.includes(url.protocol)) {
    return false;
  }

  if (requireSSL && url.protocol !== 'https:') {
    return false;
  }

  return true;
}

export function sanitizeRedirectUrl<OptionsArg extends Options>(
  domain: string,
  redirectUrl: unknown,
  options: OptionsArg = {} as OptionsArg,
): SanitizedRedirectUrl<OptionsArg> {
  if (isSafe(domain, redirectUrl, options.requireSSL)) {
    return new URL(redirectUrl, domain) as SanitizedRedirectUrl<OptionsArg>;
  } else if (options.throwOnInvalid === false) {
    return undefined as SanitizedRedirectUrl<OptionsArg>;
  } else {
    throw new ShopifyError('Invalid URL. Refusing to redirect');
  }
}

const SHOPIFY_ADMIN_HOST = 'admin.shopify.com';
const SHOP_ADMIN_HOST_REGEX = /\.myshopify\.com$/i;

/**
 * Determines whether an exit-iframe destination is one we trust enough to
 * redirect to.
 *
 * The destination comes straight from the request URL, so it is limited to:
 *
 * - the app's own origin, including relative paths (used by the OAuth flow), or
 * - the Shopify admin: `admin.shopify.com`, or `<shop>.myshopify.com` under
 *   `/admin` (where billing confirmation URLs live).
 *
 * Other Shopify-owned hosts are intentionally excluded, including storefronts
 * (`<shop>.myshopify.com/`), the CDN (`cdn.shopify.com`) and the community
 * forums (`community.shopify.com`), because their content is not controlled by
 * the app or the admin. Anything not explicitly allowed is refused.
 */
export function isTrustedExitIframeDestination(
  appUrl: string,
  destination: unknown,
): destination is string {
  if (typeof destination !== 'string' || destination.trim() === '') {
    return false;
  }

  let destinationUrl: URL;
  let appOrigin: string;
  try {
    destinationUrl = new URL(destination, appUrl);
    appOrigin = new URL(appUrl).origin;
  } catch (_error) {
    return false;
  }

  // The app's own origin (including relative paths) is always allowed.
  if (destinationUrl.origin === appOrigin) {
    return true;
  }

  // Every other destination must be a Shopify admin URL served over https with
  // no custom port.
  if (destinationUrl.protocol !== 'https:' || destinationUrl.port !== '') {
    return false;
  }

  const {hostname, pathname} = destinationUrl;

  if (hostname === SHOPIFY_ADMIN_HOST) {
    return true;
  }

  return SHOP_ADMIN_HOST_REGEX.test(hostname) && isAdminPath(pathname);
}

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}
