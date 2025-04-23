// Converts shop1.my.shop.dev to shop1.dev-api.shop.dev
export function localDevShopToApiUrl(shopUrl: string): string | null {
  if (!shopUrl) {
    return null;
  }

  const myShopDevRegex = /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.my\.shop\.dev$/;
  const matches = shopUrl.match(myShopDevRegex);

  if (matches && matches.length === 2) {
    const shopName = matches[1];
    return `${shopName}.dev-api.shop.dev`;
  }

  return null;
}

// Converts admin.shopify.com/store/my-shop to my-shop.myshopify.com
export function shopAdminUrlToLegacyUrl(shopAdminUrl: string): string | null {
  const shopUrl = removeProtocol(shopAdminUrl);

  const isShopAdminUrl = shopUrl.split('.')[0] === 'admin';

  if (!isShopAdminUrl) {
    return null;
  }

  const regex = new RegExp(`admin\\..+/store/([^/]+)`);
  const matches = shopUrl.match(regex);

  if (matches && matches.length === 2) {
    const shopName = matches[1];
    const isSpinUrl = shopUrl.includes('spin.dev/store/');
    const isLocalUrl = shopUrl.includes('shop.dev/store/');

    if (isSpinUrl) {
      return spinAdminUrlToLegacyUrl(shopUrl);
    } else if (isLocalUrl) {
      return localAdminUrlToLegacyUrl(shopUrl);
    } else {
      return `${shopName}.myshopify.com`;
    }
  } else {
    return null;
  }
}

// Converts my-shop.myshopify.com to admin.shopify.com/store/my-shop
export function legacyUrlToShopAdminUrl(legacyAdminUrl: string): string | null {
  const shopUrl = removeProtocol(legacyAdminUrl);
  const regex = new RegExp(`(.+)\\.myshopify\\.com$`);
  const matches = shopUrl.match(regex);

  if (matches && matches.length === 2) {
    const shopName = matches[1];
    return `admin.shopify.com/store/${shopName}`;
  } else {
    const isSpinUrl = shopUrl.endsWith('spin.dev');
    const isDevApiUrl = shopUrl.endsWith('dev-api.shop.dev');
    if (isSpinUrl) {
      return spinLegacyUrlToAdminUrl(shopUrl);
    } else if (isDevApiUrl) {
      return localLegacyUrlToAdminUrl(shopUrl);
    } else {
      return null;
    }
  }
}

function spinAdminUrlToLegacyUrl(shopAdminUrl: string) {
  const spinRegex = new RegExp(`admin\\.web\\.(.+\\.spin\\.dev)/store/(.+)`);
  const spinMatches = shopAdminUrl.match(spinRegex);

  if (spinMatches && spinMatches.length === 3) {
    const spinUrl = spinMatches[1];
    const shopName = spinMatches[2];
    return `${shopName}.shopify.${spinUrl}`;
  } else {
    return null;
  }
}

function localAdminUrlToLegacyUrl(shopAdminUrl: string) {
  const localRegex = new RegExp(`admin\\.shop\\.dev/store/(.+)`);
  const localMatches = shopAdminUrl.match(localRegex);

  if (localMatches && localMatches.length === 2) {
    const shopName = localMatches[1];
    return `${shopName}.dev-api.shop.dev`;
  } else {
    return null;
  }
}

function spinLegacyUrlToAdminUrl(legacyAdminUrl: string) {
  const spinRegex = new RegExp(`(.+)\\.shopify\\.(.+\\.spin\\.dev)`);
  const spinMatches = legacyAdminUrl.match(spinRegex);

  if (spinMatches && spinMatches.length === 3) {
    const shopName = spinMatches[1];
    const spinUrl = spinMatches[2];
    return `admin.web.${spinUrl}/store/${shopName}`;
  } else {
    return null;
  }
}

function localLegacyUrlToAdminUrl(legacyAdminUrl: string) {
  // For backward compatibility
  const legacyLocalRegex = new RegExp(`(.+)\\.shop\\.dev$`);
  const legacyLocalMatches = legacyAdminUrl.match(legacyLocalRegex);

  if (legacyLocalMatches && legacyLocalMatches.length === 2) {
    const shopName = legacyLocalMatches[1];
    return `admin.shop.dev/store/${shopName}`;
  }

  // Handle the new dev-api format shop.dev-api.shop.dev
  if (legacyAdminUrl.endsWith('.dev-api.shop.dev')) {
    // Extract just the shop name part
    const parts = legacyAdminUrl.split('.');
    if (parts.length >= 3) {
      const shopName = parts[0];
      return `admin.shop.dev/store/${shopName}`;
    }
  }

  return null;
}
function removeProtocol(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}
