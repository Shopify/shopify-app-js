import {shopifyApi} from '../..';
import {testConfig} from '../../__tests__/test-config';
import {InvalidShopError} from '../../error';

const VALID_SHOP_URL_1 = 'someshop.myshopify.com';
const VALID_SHOP_URL_2 = 'devshop.myshopify.io';
const VALID_SHOP_URL_3 = 'test-shop.myshopify.com';
const VALID_SHOP_URL_4 = 'dev-shop-.myshopify.io';

const INVALID_SHOP_URL_1 = 'notshopify.com';
const INVALID_SHOP_URL_2 = '-invalid.myshopify.io';
const VALID_SHOPIFY_HOST_BUT_NOT_VALID_ADMIN_URL =
  'not-admin.shopify.com/store/my-shop';

const CUSTOM_DOMAIN = 'my-custom-domain.com';
const VALID_SHOP_WITH_CUSTOM_DOMAIN = `my-shop.${CUSTOM_DOMAIN}`;
const INVALID_SHOP_WITH_CUSTOM_DOMAIN = `my-shop.${CUSTOM_DOMAIN}.nope`;

const CUSTOM_DOMAIN_REGEX = /my-other-custom-domain\.com/;
const VALID_SHOP_WITH_CUSTOM_DOMAIN_REGEX = `my-shop.my-other-custom-domain.com`;
const INVALID_SHOP_WITH_CUSTOM_DOMAIN_REGEX = `my-shop.my-other-custom-domain.com.nope`;

const VALID_HOSTS = [
  'my-host.myshopify.com/admin',
  'my-other-host.myshopify.com/admin',
  'my-other-other-host.myshopify.io/admin',
  'admin.shopify.com/store/my-shop',
  'admin.spin.dev/store/my-shop',
  'admin.shop.dev/store/my-shop',
].map((testhost) => {
  return {testhost, base64host: Buffer.from(testhost).toString('base64')};
});

const VALID_SHOP_ADMIN_URLS = [
  {
    adminUrl: 'admin.shopify.com/store/my-shop',
    legacyAdminUrl: 'my-shop.myshopify.com',
  },
];

const INVALID_HOSTS = [
  {
    testhost: 'plain-string-is-not-base64',
    base64host: 'plain-string-is-not-base64',
  },
  {
    testhost: "valid host but ending with '-nope'",
    base64host: `${Buffer.from('my-other-host.myshopify.com/admin').toString(
      'base64',
    )}-nope`,
  },
  {
    testhost: 'my-fake-host.notshopify.com/admin',
    base64host: Buffer.from('my-fake-host.notshopify.com/admin').toString(
      'base64',
    ),
  },
];

describe('sanitizeShop', () => {
  test('returns the shop for valid URLs', () => {
    const shopify = shopifyApi(testConfig());

    expect(shopify.utils.sanitizeShop(VALID_SHOP_URL_1)).toEqual(
      VALID_SHOP_URL_1,
    );
    expect(shopify.utils.sanitizeShop(VALID_SHOP_URL_2)).toEqual(
      VALID_SHOP_URL_2,
    );
    expect(shopify.utils.sanitizeShop(VALID_SHOP_URL_3)).toEqual(
      VALID_SHOP_URL_3,
    );
    expect(shopify.utils.sanitizeShop(VALID_SHOP_URL_4)).toEqual(
      VALID_SHOP_URL_4,
    );
  });

  test.each([
    INVALID_SHOP_URL_1,
    INVALID_SHOP_URL_2,
    VALID_SHOPIFY_HOST_BUT_NOT_VALID_ADMIN_URL,
  ])('returns null for invalid URL - %s', (invalidUrl) => {
    const shopify = shopifyApi(testConfig());

    expect(shopify.utils.sanitizeShop(invalidUrl)).toBe(null);
  });

  test('throws for invalid URLs if set to', () => {
    const shopify = shopifyApi(testConfig());

    expect(() => shopify.utils.sanitizeShop(INVALID_SHOP_URL_1, true)).toThrow(
      InvalidShopError,
    );
    expect(() => shopify.utils.sanitizeShop(INVALID_SHOP_URL_2, true)).toThrow(
      InvalidShopError,
    );
  });

  test.each(VALID_SHOP_ADMIN_URLS)(
    'accepts new format of shop admin URLs and converts to legacy admin URLs - %s',
    ({adminUrl, legacyAdminUrl}) => {
      const shopify = shopifyApi(testConfig());
      const actual = shopify.utils.sanitizeShop(adminUrl);

      expect(actual).toEqual(legacyAdminUrl);
    },
  );
});

describe('sanitizeHost', () => {
  VALID_HOSTS.forEach(({testhost, base64host}) => {
    test(`returns the host for ${testhost}`, () => {
      const shopify = shopifyApi(testConfig());

      expect(shopify.utils.sanitizeHost(base64host)).toEqual(base64host);
    });
  });

  INVALID_HOSTS.forEach(({testhost, base64host}) => {
    test(`returns null for ${testhost}`, () => {
      const shopify = shopifyApi(testConfig());

      expect(shopify.utils.sanitizeHost(base64host)).toBe(null);
    });
  });
});

describe('domain transformations', () => {
  describe('sanitizeShop with domain transformations', () => {
    test('validates and transforms split domains with template strings', () => {
      const shopify = shopifyApi(
        testConfig({
          domainTransformations: [
            {
              match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.my\.shop\.dev$/,
              transform: '$1.dev-api.shop.dev',
            },
          ],
        }),
      );

      expect(shopify.utils.sanitizeShop('shop1.my.shop.dev')).toBe(
        'shop1.dev-api.shop.dev',
      );
    });

    test('validates and transforms with function-based transformations', () => {
      const shopify = shopifyApi(
        testConfig({
          domainTransformations: [
            {
              match: /^([a-zA-Z0-9-_]+)\.ui\.example\.com$/,
              transform: (matches) => `${matches[1]}.api.example.com`,
            },
          ],
        }),
      );

      expect(shopify.utils.sanitizeShop('shop1.ui.example.com')).toBe(
        'shop1.api.example.com',
      );
    });

    test('validates both source and target domains', () => {
      const shopify = shopifyApi(
        testConfig({
          domainTransformations: [
            {
              match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.my\.shop\.dev$/,
              transform: '$1.dev-api.shop.dev',
            },
          ],
        }),
      );

      // Source domain should be valid and transformed
      expect(shopify.utils.sanitizeShop('shop1.my.shop.dev')).not.toBeNull();

      // Target domain should also be valid (already transformed)
      expect(shopify.utils.sanitizeShop('shop1.dev-api.shop.dev')).toBe(
        'shop1.dev-api.shop.dev',
      );
    });

    test('applies first matching transformation in order', () => {
      const shopify = shopifyApi(
        testConfig({
          domainTransformations: [
            {
              match: /^test-.*\.ui\.example\.com$/,
              transform: (matches) =>
                matches[0].replace('.ui.', '.staging-api.'),
            },
            {
              match: /^([a-zA-Z0-9-_]+)\.ui\.example\.com$/,
              transform: '$1.api.example.com',
            },
          ],
        }),
      );

      expect(shopify.utils.sanitizeShop('test-shop.ui.example.com')).toBe(
        'test-shop.staging-api.example.com',
      );

      expect(shopify.utils.sanitizeShop('shop1.ui.example.com')).toBe(
        'shop1.api.example.com',
      );
    });

    test('returns original domain when no transformation matches', () => {
      const shopify = shopifyApi(
        testConfig({
          domainTransformations: [
            {
              match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.my\.shop\.dev$/,
              transform: '$1.dev-api.shop.dev',
            },
          ],
        }),
      );

      expect(shopify.utils.sanitizeShop('shop1.myshopify.com')).toBe(
        'shop1.myshopify.com',
      );
    });

    test('handles multiple capture groups', () => {
      const shopify = shopifyApi(
        testConfig({
          domainTransformations: [
            {
              match: /^([a-zA-Z0-9-]+)-([a-z]+)\.admin\.example\.com$/,
              transform: '$1.$2.api.example.com',
            },
          ],
        }),
      );

      expect(shopify.utils.sanitizeShop('shop1-us.admin.example.com')).toBe(
        'shop1.us.api.example.com',
      );
    });

    test('complex transformation logic based on shop name', () => {
      const shopify = shopifyApi(
        testConfig({
          domainTransformations: [
            {
              match: /^([a-zA-Z0-9-_]+)\.admin\.mycompany\.com$/,
              transform: (matches) => {
                const shopName = matches[1];

                if (shopName.startsWith('premium-')) {
                  return `${shopName}.api-premium.mycompany.com`;
                }

                if (shopName.startsWith('test-')) {
                  return `${shopName}.api-test.mycompany.com`;
                }

                return `${shopName}.api.mycompany.com`;
              },
            },
          ],
        }),
      );

      expect(
        shopify.utils.sanitizeShop('premium-shop1.admin.mycompany.com'),
      ).toBe('premium-shop1.api-premium.mycompany.com');

      expect(shopify.utils.sanitizeShop('test-shop1.admin.mycompany.com')).toBe(
        'test-shop1.api-test.mycompany.com',
      );

      expect(shopify.utils.sanitizeShop('shop1.admin.mycompany.com')).toBe(
        'shop1.api.mycompany.com',
      );
    });
  });

  describe('sanitizeHost with domain transformations', () => {
    test('validates hosts with transformation domains', () => {
      const shopify = shopifyApi(
        testConfig({
          domainTransformations: [
            {
              match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.my\.shop\.dev$/,
              transform: '$1.dev-api.shop.dev',
            },
          ],
        }),
      );

      const myShopDevHost = Buffer.from('shop1.my.shop.dev/admin').toString(
        'base64',
      );
      const devApiHost = Buffer.from('shop1.dev-api.shop.dev/admin').toString(
        'base64',
      );

      // Both source and target domains should be valid hosts
      expect(shopify.utils.sanitizeHost(myShopDevHost)).toEqual(myShopDevHost);
      expect(shopify.utils.sanitizeHost(devApiHost)).toEqual(devApiHost);
    });

    test('respects includeHost: false flag', () => {
      const shopify = shopifyApi(
        testConfig({
          domainTransformations: [
            {
              match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.custom\.local\.dev$/,
              transform: '$1.api.custom.local.dev',
              includeHost: false,
            },
          ],
        }),
      );

      const customLocalDevHost = Buffer.from(
        'shop1.custom.local.dev/admin',
      ).toString('base64');

      // Domain transformation should not apply to host validation
      // since includeHost is false, neither source nor target domains should be valid
      expect(shopify.utils.sanitizeHost(customLocalDevHost)).toBeNull();
    });
  });
});
