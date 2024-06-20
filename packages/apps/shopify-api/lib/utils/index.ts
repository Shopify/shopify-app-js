import {ConfigInterface} from '../base-types';

import {sanitizeShop, sanitizeHost} from './shop-validator';
import {validateHmac} from './hmac-validator';
import {versionCompatible, versionPriorTo} from './version-compatible';
import {
  shopAdminUrlToLegacyUrl,
  legacyUrlToShopAdminUrl,
} from './shop-admin-url-helper';
import ProcessedQuery from './processed-query';

export function shopifyUtils(config: ConfigInterface) {
  return {
    sanitizeShop: sanitizeShop(config),
    sanitizeHost: sanitizeHost(),
    validateHmac: validateHmac(config),
    versionCompatible: versionCompatible(config),
    versionPriorTo: versionPriorTo(config),
    shopAdminUrlToLegacyUrl,
    legacyUrlToShopAdminUrl,
    ProcessedQuery,
  };
}

export type ShopifyUtils = ReturnType<typeof shopifyUtils>;
