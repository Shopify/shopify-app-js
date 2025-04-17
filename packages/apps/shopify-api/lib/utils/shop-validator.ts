import {ConfigInterface} from '../base-types';
import {InvalidHostError, InvalidShopError} from '../error';
import {decodeHost} from '../auth/decode-host';

import {shopAdminUrlToLegacyUrl} from './shop-admin-url-helper';

export function sanitizeShop(config: ConfigInterface) {
  return (shop: string, throwOnInvalid = false): string | null => {
    config.logger.log(3, 'ZL-------------- IN HERE YO');
    let shopUrl = shop;
    const domainsRegex = [
      'myshopify\\.com',
      'shopify\\.com',
      'myshopify\\.io',
      'shop\\.dev\*',
      'dev-api\\.shop\\.dev',
    ];
    config.logger.log(3, `ZL-------------- shopULR ${shopUrl}`);

    if (config.customShopDomains) {
      domainsRegex.push(
        ...config.customShopDomains.map((regex) =>
          typeof regex === 'string' ? regex : regex.source,
        ),
      );
    }
    config.logger.log(3, `ZL-------------- 1`);

    const shopUrlRegex = new RegExp(
      `^[a-zA-Z0-9][a-zA-Z0-9-_]*\\.(${domainsRegex.join('|')})[/]*$`,
    );

    const shopAdminRegex = new RegExp(
      `^admin\\.(${domainsRegex.join('|')})/store/([a-zA-Z0-9][a-zA-Z0-9-_]*)$`,
    );

    config.logger.log(3, `ZL-------------- 2`);
    const isShopAdminUrl = shopAdminRegex.test(shopUrl);
    if (isShopAdminUrl) {
      shopUrl = shopAdminUrlToLegacyUrl(shopUrl) || '';
    }

    console.log(`### ### ### ISADMIN: ${isShopAdminUrl}`);
    const localDevUrlRegex = new RegExp(
      `^[a-zA-Z0-9][a-zA-Z0-9-_]*\\.[a-zA-Z0-9][a-zA-Z0-9-_]*\\.shop\\.dev$`,
    );

    let sanitizedShop = null;
    if (shopUrlRegex.test(shopUrl)) {
      sanitizedShop = shopUrl;
    } else if (localDevUrlRegex.test(shopUrl)) {
      const match = shopUrl.match(localDevUrlRegex);

      if (match) {
        const shopName = match[1];
        const transformedShopUrl = `${shopName}.dev-api.shop.dev`;
        // transformedShopUrl will be "shop1.dev-api.shop.dev"
      }
    }

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
