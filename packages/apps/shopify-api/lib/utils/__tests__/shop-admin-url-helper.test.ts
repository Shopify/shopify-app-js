import {shopifyApi} from '../..';
import {testConfig} from '../../__tests__/test-config';

const VALID_URLS = [
  {
    adminUrl: 'admin.shopify.com/store/my-shop',
    legacyAdminUrl: 'my-shop.myshopify.com',
  },
  {
    adminUrl: 'admin.web.abc.def-gh.ij.spin.dev/store/my-shop',
    legacyAdminUrl: 'my-shop.shopify.abc.def-gh.ij.spin.dev',
  },
  {
    adminUrl: 'admin.shop.dev/store/my-shop',
    legacyAdminUrl: 'my-shop.shop.dev',
  },
];

const INVALID_ADMIN_URLS = [
  'not-admin.shopify.com/store/my-shop',
  'adminisnotthis.shopify.com/store/my-shop',
  'adminisnot.web.abc.def-gh.ij.spin.dev/store/my-shop',
  'admin.what.abc.def-gh.ij.spin.dev/store/my-shop',
];

const INVALID_LEGACY_URLS = [
  'notshopify.com',
  'my-shop.myshopify.com.nope',
  'my-shop.myshopify.com/admin',
];

describe.each(VALID_URLS)(
  'For valid shop URL: %s',
  ({adminUrl, legacyAdminUrl}) => {
    it('can convert from shop admin URL to legacy URL', () => {
      const shopify = shopifyApi(testConfig());
      const actual = shopify.utils.shopAdminUrlToLegacyUrl(adminUrl);
      expect(actual).toEqual(legacyAdminUrl);
    });

    it('can convert from legacy URL to shop admin URL', () => {
      const shopify = shopifyApi(testConfig());
      const actual = shopify.utils.legacyUrlToShopAdminUrl(legacyAdminUrl);
      expect(actual).toEqual(adminUrl);
    });

    it('can strip protocol before converting from shop admin URL to legacy URL', () => {
      const shopify = shopifyApi(testConfig());
      const urlWithProtocol = `https://${adminUrl}`;
      const actual = shopify.utils.shopAdminUrlToLegacyUrl(urlWithProtocol);
      expect(actual).toEqual(legacyAdminUrl);
    });

    it('can strip protocol before converting from legacy URL to shop admin URL', () => {
      const shopify = shopifyApi(testConfig());
      const urlWithProtocol = `https://${legacyAdminUrl}`;
      const actual = shopify.utils.legacyUrlToShopAdminUrl(urlWithProtocol);
      expect(actual).toEqual(adminUrl);
    });
  },
);

describe.each(INVALID_ADMIN_URLS)(
  'For invalid shop admin URL: %s',
  (invalidUrl) => {
    it('returns null when trying to convert from shop admin url to legacy url', () => {
      const shopify = shopifyApi(testConfig());

      expect(shopify.utils.shopAdminUrlToLegacyUrl(invalidUrl)).toBe(null);
    });
  },
);

describe.each(INVALID_LEGACY_URLS)(
  'For invalid legacy shop URL: %s',
  (invalidUrl) => {
    it('returns null when trying to convert from legacy url to shop admin url', () => {
      const shopify = shopifyApi(testConfig());

      expect(shopify.utils.legacyUrlToShopAdminUrl(invalidUrl)).toBe(null);
    });
  },
);

describe('localDevShopToApiUrl', () => {
  const validMyShopDevUrls = [
    {input: 'shop1.my.shop.dev', expected: 'shop1.dev-api.shop.dev'},
    {input: 'test-shop.my.shop.dev', expected: 'test-shop.dev-api.shop.dev'},
    {input: 'dev-shop_.my.shop.dev', expected: 'dev-shop_.dev-api.shop.dev'},
    {input: 'shop123.my.shop.dev', expected: 'shop123.dev-api.shop.dev'},
  ];

  const invalidMyShopDevUrls = [
    'shop1.shop.dev',
    'shop1.myshopify.com',
    'my.shop.dev',
    '.my.shop.dev',
    'shop1.my.shop.dev.com',
    'shop1.other.my.shop.dev',
    '',
    null,
  ];

  describe.each(validMyShopDevUrls)(
    'For valid my.shop.dev URL: $input',
    ({input, expected}) => {
      it('converts to dev-api.shop.dev URL', () => {
        const shopify = shopifyApi(testConfig());
        const actual = shopify.utils.localDevShopToApiUrl(input);
        expect(actual).toEqual(expected);
      });
    },
  );

  describe.each(invalidMyShopDevUrls)('For invalid URL: %s', (invalidUrl) => {
    it('returns null', () => {
      const shopify = shopifyApi(testConfig());
      expect(shopify.utils.localDevShopToApiUrl(invalidUrl as string)).toBe(
        null,
      );
    });
  });
});

describe('localLegacyUrlToAdminUrl with .shop.dev variations', () => {
  const shopDevUrls = [
    {
      input: 'shop1.dev-api.shop.dev',
      expected: 'admin.shop.dev/store/shop1.dev-api',
    },
    {
      input: 'test-shop.some.shop.dev',
      expected: 'admin.shop.dev/store/test-shop.some',
    },
    {
      input: 'my-shop.other.shop.dev',
      expected: 'admin.shop.dev/store/my-shop.other',
    },
  ];

  describe.each(shopDevUrls)(
    'For .shop.dev URL with subdomains: $input',
    ({input, expected}) => {
      it('captures all subdomain parts as shop name', () => {
        const shopify = shopifyApi(testConfig());
        const actual = shopify.utils.legacyUrlToShopAdminUrl(input);
        expect(actual).toEqual(expected);
      });
    },
  );
});
