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
  } catch (error) {
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
