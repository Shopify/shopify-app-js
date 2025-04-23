import {ConfigInterface} from '../base-types';
import {InvalidHostError, InvalidShopError} from '../error';
import {decodeHost} from '../auth/decode-host';

import {shopAdminUrlToLegacyUrl} from './shop-admin-url-helper';

// Helper function to convert shop1.my.shop.dev to shop1.dev-api.shop.dev
function sanitizeLocalDevShop(shopUrl: string): string | null {
  const myShopDevRegex = /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.my\.shop\.dev$/;
  const matches = shopUrl.match(myShopDevRegex);

  if (matches && matches.length === 2) {
    const shopName = matches[1];
    return `${shopName}.dev-api.shop.dev`;
  }

  return null;
}

export function sanitizeShop(config: ConfigInterface) {
  return (shop: string, throwOnInvalid = false): string | null => {
    let shopUrl = shop;

    // Check for local dev shop URL format
    const sanitizedLocalDevShop = sanitizeLocalDevShop(shopUrl);
    if (sanitizedLocalDevShop) {
      return sanitizedLocalDevShop;
    }

    const domainsRegex = [
      'myshopify\\.com',
      'shopify\\.com',
      'myshopify\\.io',
      'shop\\.dev',
      'dev-api\\.shop\\.dev',
    ];
    if (config.customShopDomains) {
      domainsRegex.push(
        ...config.customShopDomains.map((regex) =>
          typeof regex === 'string' ? regex : regex.source,
        ),
      );
    }

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

    return sanitizedShop;
  };
}

export function sanitizeHost() {
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
        'my\\.shop\\.dev',
        'dev-api\\.shop\\.dev',
      ];

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
