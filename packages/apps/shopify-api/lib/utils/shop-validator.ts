import {ConfigInterface} from '../base-types';
import {InvalidHostError, InvalidShopError} from '../error';
import {decodeHost} from '../auth/decode-host';

import {shopAdminUrlToLegacyUrl} from './shop-admin-url-helper';
import {
  applyDomainTransformations,
  getTransformationDomains,
} from './domain-transformer';

// The domains the library trusts a shop to be on, as regex fragments: the Shopify-owned set, plus
// both ends of every configured transformation.
function trustedShopDomains(config: ConfigInterface): string[] {
  const domainsRegex = [
    'myshopify\\.com',
    'shopify\\.com',
    'myshopify\\.io',
    'shop\\.dev',
  ];

  if (config.domainTransformations) {
    domainsRegex.push(...getTransformationDomains(config));
  }

  return domainsRegex;
}

export function sanitizeShop(config: ConfigInterface) {
  return (shop: string, throwOnInvalid = false): string | null => {
    let shopUrl = shop;
    const domainsRegex = trustedShopDomains(config);

    const shopUrlRegex = new RegExp(
      `^[a-zA-Z0-9][a-zA-Z0-9-_]*\\.(${domainsRegex.join('|')})[/]*$`,
    );

    const shopAdminRegex = new RegExp(
      `^admin\\.(${domainsRegex.join('|')})/store/([a-zA-Z0-9][a-zA-Z0-9-_]*)$`,
    );

    const isShopAdminUrl = shopAdminRegex.test(shopUrl);
    if (isShopAdminUrl) {
      shopUrl = shopAdminUrlToLegacyUrl(shopUrl) || '';
    }

    const sanitizedShop = shopUrlRegex.test(shopUrl) ? shopUrl : null;
    if (!sanitizedShop && throwOnInvalid) {
      throw new InvalidShopError('Received invalid shop argument');
    }

    if (sanitizedShop && config.domainTransformations) {
      return applyDomainTransformations(sanitizedShop, config);
    }

    return sanitizedShop;
  };
}

/**
 * Whether a shop domain is made up of printable ASCII characters only.
 *
 * Shop handles and Shopify's domains are ASCII, and `toLowerCase()` folds some non-ASCII characters
 * into ASCII ones: `'sho\u212A.myshopify.com'` (U+212A KELVIN SIGN) becomes `'shok.myshopify.com'`.
 * A caller naming one shop would get a domain for a different, real-looking one, so a non-ASCII
 * host is rejected rather than normalised.
 */
export function isAsciiShopDomain(shop: string): boolean {
  return /^[\u0020-\u007E]*$/.test(shop);
}

/**
 * Returns the shop's permanent domain, in the form Shopify's own records hold it: lower-cased, with
 * no trailing slash, and with an `admin.*` URL converted to the legacy form.
 *
 * Unlike {@link sanitizeShop} this never applies a `domainTransformations` rule. A transformation
 * describes where a request is *routed*; this answers which shop it is *for*, which is what a token
 * endpoint audience has to name. Returns `null` for anything that is not on a trusted domain.
 */
export function canonicalShopDomain(config: ConfigInterface) {
  return (shop: string): string | null => {
    if (typeof shop !== 'string' || !isAsciiShopDomain(shop)) {
      return null;
    }

    // Hostnames are case-insensitive and a trailing slash is not part of one, but the audience has
    // to match the canonical endpoint byte for byte.
    const normalizedShop = shop.replace(/\/+$/, '').toLowerCase();
    const domainsRegex = trustedShopDomains(config);

    const shopAdminRegex = new RegExp(
      `^admin\\.(${domainsRegex.join('|')})/store/([a-z0-9][a-z0-9-_]*)$`,
    );
    const shopUrl = shopAdminRegex.test(normalizedShop)
      ? shopAdminUrlToLegacyUrl(normalizedShop) || ''
      : normalizedShop;

    const shopUrlRegex = new RegExp(
      `^[a-z0-9][a-z0-9-_]*\\.(${domainsRegex.join('|')})$`,
    );

    return shopUrlRegex.test(shopUrl) ? shopUrl : null;
  };
}

export function sanitizeHost(config: ConfigInterface) {
  return (host: string, throwOnInvalid = false): string | null => {
    const base64regex = /^[0-9a-zA-Z+/]+={0,2}$/;

    let sanitizedHost = base64regex.test(host) ? host : null;
    if (sanitizedHost) {
      const {hostname} = new URL(`https://${decodeHost(sanitizedHost)}`);

      const originsRegex = [
        'myshopify\\.com',
        'shopify\\.com',
        'myshopify\\.io',
        'spin\\.dev',
        'shop\\.dev',
      ];

      if (config.domainTransformations) {
        const hostTransformationDomains = config.domainTransformations
          .filter((t) => t.includeHost !== false)
          .flatMap((t) =>
            getTransformationDomains({
              ...config,
              domainTransformations: [t],
            }),
          );
        originsRegex.push(...hostTransformationDomains);
      }

      const hostRegex = new RegExp(`\\.(${originsRegex.join('|')})$`);
      if (!hostRegex.test(hostname)) {
        sanitizedHost = null;
      }
    }
    if (!sanitizedHost && throwOnInvalid) {
      throw new InvalidHostError('Received invalid host argument');
    }

    return sanitizedHost;
  };
}
