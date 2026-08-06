import crypto from 'crypto';

import {testConfig} from '../../__tests__/test-config';
import {AuthQuery} from '../../auth/oauth/types';
import * as ShopifyErrors from '../../error';
import {HMACSignator, getCurrentTimeInSec} from '../hmac-validator';
import {shopifyApi} from '../..';

describe('validateHmac', () => {
  describe.each([[undefined], ['admin' as HMACSignator]])(
    'when signator is "%p"',
    (signator) => {
      const options = signator && {signator};
      const queryParams = {
        code: 'some code goes here',
        shop: 'the shop URL',
        state: 'some nonce passed from auth',
        timestamp: String(getCurrentTimeInSec() - 60),
      };

      test('returns true when timestamp and hmac is correct', async () => {
        const shopify = shopifyApi(
          testConfig({apiSecretKey: 'my super secret key'}),
        );

        const queryString = `code=some%20code%20goes%20here&shop=the%20shop%20URL&state=some%20nonce%20passed%20from%20auth&timestamp=${queryParams.timestamp}`;
        const query = {
          ...queryParams,
          hmac: createHmacSignature(queryString, shopify.config.apiSecretKey),
        };

        const validateHmac = shopify.utils.validateHmac;
        await expect(validateHmac(query, options)).resolves.toBe(true);
      });

      test('returns false when the hmac does not match', async () => {
        const shopify = shopifyApi(
          testConfig({apiSecretKey: 'my super secret key'}),
        );

        const badQuery: AuthQuery = {
          ...queryParams,
          hmac: 'incorrect_hmac_string',
        };

        const validateHmac = shopify.utils.validateHmac;
        await expect(validateHmac(badQuery, options)).resolves.toBe(false);
      });

      test('queries with extra keys include those extra keys in hmac querystring', async () => {
        const shopify = shopifyApi(
          testConfig({apiSecretKey: 'my super secret key'}),
        );

        // NB: keys are listed alphabetically
        const queryString = `code=some%20code%20goes%20here&foo=bar&shop=the%20shop%20URL&state=some%20nonce%20passed%20from%20auth&timestamp=${queryParams.timestamp}`;

        const query = {
          ...queryParams,
          foo: 'bar',
          hmac: createHmacSignature(queryString, shopify.config.apiSecretKey),
        };

        await expect(shopify.utils.validateHmac(query, options)).resolves.toBe(
          true,
        );
      });

      test('spaces in param values are percent-encoded (%20), not plus-encoded', async () => {
        const shopify = shopifyApi(
          testConfig({apiSecretKey: 'my super secret key'}),
        );

        const timestamp = String(getCurrentTimeInSec() - 60);
        const queryWithSpaces = {
          custom: 'hello world',
          shop: 'myshop.myshopify.com',
          timestamp,
        };

        // Shopify signs with %20, not +
        const queryString = `custom=hello%20world&shop=myshop.myshopify.com&timestamp=${timestamp}`;
        const query = {
          ...queryWithSpaces,
          hmac: createHmacSignature(queryString, shopify.config.apiSecretKey),
        };

        await expect(shopify.utils.validateHmac(query, options)).resolves.toBe(
          true,
        );
      });

      test('throws InvalidHmacError when there is no hmac key', async () => {
        const shopify = shopifyApi(testConfig());

        const noHmacQuery = {
          ...queryParams,
        };

        await expect(
          shopify.utils.validateHmac(noHmacQuery, options),
        ).rejects.toBeInstanceOf(ShopifyErrors.InvalidHmacError);
      });

      test('throws InvalidHmacError when timestamp is older than 0 seconds', async () => {
        const shopify = shopifyApi(
          testConfig({apiSecretKey: 'my super secret key'}),
        );

        const timestamp = String(getCurrentTimeInSec() - 91);
        const queryString = `code=some%20code%20goes%20here&shop=the%20shop%20URL&state=some%20nonce%20passed%20from%20auth&timestamp=${timestamp}`;
        const query = {
          ...queryParams,
          timestamp,
          hmac: createHmacSignature(queryString, shopify.config.apiSecretKey),
        };

        const validateHmac = shopify.utils.validateHmac;
        await expect(validateHmac(query, options)).rejects.toBeInstanceOf(
          ShopifyErrors.InvalidHmacError,
        );
      });

      test('throws InvalidHmacError when timestamp is more than 90 seconds in the future', async () => {
        const shopify = shopifyApi(
          testConfig({apiSecretKey: 'my super secret key'}),
        );

        const timestamp = String(getCurrentTimeInSec() + 91);
        const queryString = `code=some%20code%20goes%20here&shop=the%20shop%20URL&state=some%20nonce%20passed%20from%20auth&timestamp=${timestamp}`;
        const query = {
          ...queryParams,
          timestamp,
          hmac: createHmacSignature(queryString, shopify.config.apiSecretKey),
        };

        const validateHmac = shopify.utils.validateHmac;
        await expect(validateHmac(query, options)).rejects.toBeInstanceOf(
          ShopifyErrors.InvalidHmacError,
        );
      });
    },
  );

  describe('when signator is "appProxy"', () => {
    const options = {signator: 'appProxy' as HMACSignator};
    const queryParams = {
      shop: 'the shop URL',
      logged_in_customer_id: '1',
      path_prefix: '/apps/my_app',
      timestamp: String(getCurrentTimeInSec() - 60),
    };

    test('returns true when timestamp and hmac is correct', async () => {
      const shopify = shopifyApi(
        testConfig({apiSecretKey: 'my super secret key'}),
      );

      const queryString = `logged_in_customer_id=1path_prefix=/apps/my_appshop=the shop URLtimestamp=${queryParams.timestamp}`;
      const query = {
        ...queryParams,
        signature: createHmacSignature(
          queryString,
          shopify.config.apiSecretKey,
        ),
      };

      const validateHmac = shopify.utils.validateHmac;
      await expect(validateHmac(query, options)).resolves.toBe(true);
    });

    test('returns false when the hmac does not match', async () => {
      const shopify = shopifyApi(
        testConfig({apiSecretKey: 'my super secret key'}),
      );

      const badQuery: AuthQuery = {
        ...queryParams,
        signature: 'incorrect_hmac_string',
      };

      const validateHmac = shopify.utils.validateHmac;
      await expect(validateHmac(badQuery, options)).resolves.toBe(false);
    });

    test('queries with extra keys include those extra keys in hmac querystring', async () => {
      const shopify = shopifyApi(
        testConfig({apiSecretKey: 'my super secret key'}),
      );

      // NB: keys are listed alphabetically
      const queryString = `foo=barlogged_in_customer_id=1path_prefix=/apps/my_appshop=the shop URLtimestamp=${queryParams.timestamp}`;
      const query = {
        ...queryParams,
        foo: 'bar',
        signature: createHmacSignature(
          queryString,
          shopify.config.apiSecretKey,
        ),
      };

      await expect(shopify.utils.validateHmac(query, options)).resolves.toBe(
        true,
      );
    });

    test('accepts URLSearchParams and preserves repeated application params', async () => {
      const shopify = shopifyApi(
        testConfig({apiSecretKey: 'my super secret key'}),
      );
      const query = new URLSearchParams(queryParams);
      query.append('consentGiven', 'true');
      query.append('consentGiven', 'false');
      query.set(
        'signature',
        createHmacSignature(
          `consentGiven=true,falselogged_in_customer_id=1path_prefix=/apps/my_appshop=the shop URLtimestamp=${queryParams.timestamp}`,
          shopify.config.apiSecretKey,
        ),
      );

      await expect(shopify.utils.validateHmac(query, options)).resolves.toBe(
        true,
      );
    });

    test.each(['hmac', 'shop', 'signature', 'timestamp'])(
      'rejects a repeated security param: %s',
      async (param) => {
        const shopify = shopifyApi(testConfig());
        const query = new URLSearchParams({
          ...queryParams,
          hmac: 'unused',
          signature: 'unused',
        });
        query.append(param, 'duplicate');

        await expect(
          shopify.utils.validateHmac(query, options),
        ).rejects.toThrow(
          `Query parameter "${param}" must not appear more than once.`,
        );
      },
    );

    test('throw InvalidHmacError when there is no signature key', async () => {
      const shopify = shopifyApi(testConfig());

      const noSignatureQuery = {
        ...queryParams,
      };

      await expect(
        shopify.utils.validateHmac(noSignatureQuery, options),
      ).rejects.toBeInstanceOf(ShopifyErrors.InvalidHmacError);
    });

    test('throws InvalidHmacError when timestamp is older than 90 seconds', async () => {
      const shopify = shopifyApi(
        testConfig({apiSecretKey: 'my super secret key'}),
      );

      const timestamp = String(getCurrentTimeInSec() - 91);
      const queryString = `code=some%20code%20goes%20here&shop=the%20shop%20URL&state=some%20nonce%20passed%20from%20auth&timestamp=${timestamp}`;
      const query = {
        ...queryParams,
        timestamp,
        signature: createHmacSignature(
          queryString,
          shopify.config.apiSecretKey,
        ),
      };

      const validateHmac = shopify.utils.validateHmac;
      await expect(validateHmac(query, options)).rejects.toBeInstanceOf(
        ShopifyErrors.InvalidHmacError,
      );
    });

    test('throws InvalidHmacError when timestamp is more than 90 seconds in the future', async () => {
      const shopify = shopifyApi(
        testConfig({apiSecretKey: 'my super secret key'}),
      );

      const timestamp = String(getCurrentTimeInSec() + 91);
      const queryString = `code=some%20code%20goes%20here&shop=the%20shop%20URL&state=some%20nonce%20passed%20from%20auth&timestamp=${timestamp}`;
      const query = {
        ...queryParams,
        timestamp,
        hmac: createHmacSignature(queryString, shopify.config.apiSecretKey),
      };

      const validateHmac = shopify.utils.validateHmac;
      await expect(validateHmac(query, options)).rejects.toBeInstanceOf(
        ShopifyErrors.InvalidHmacError,
      );
    });
  });
});

describe('App Proxy HMAC hardening', () => {
  const SECRET = 'my super secret key';
  const options = {signator: 'appProxy' as HMACSignator};

  test.each([
    ['missing', undefined],
    ['NaN', 'not-a-number'],
    ['Infinity', 'Infinity'],
    ['-Infinity', '-Infinity'],
    ['non-integer', '123.45'],
    ['empty', ''],
  ])('rejects a %s timestamp', async (_label, timestamp) => {
    const shopify = shopifyApi(testConfig({apiSecretKey: SECRET}));

    const query: Record<string, string> = {
      shop: 'shop.myshopify.com',
      foo: 'bar',
      signature: 'unused',
    };
    if (timestamp !== undefined) {
      query.timestamp = timestamp;
    }

    await expect(
      shopify.utils.validateHmac(query, options),
    ).rejects.toBeInstanceOf(ShopifyErrors.InvalidHmacError);
  });

  test('rejects a plain object with a null timestamp', async () => {
    const shopify = shopifyApi(testConfig({apiSecretKey: SECRET}));

    const query: Record<string, unknown> = {
      shop: 'shop.myshopify.com',
      timestamp: null,
      signature: 'unused',
    };

    await expect(
      shopify.utils.validateHmac(query as any, options),
    ).rejects.toBeInstanceOf(ShopifyErrors.InvalidHmacError);
  });

  test('rejects an array-valued timestamp on the admin signator', async () => {
    const shopify = shopifyApi(testConfig({apiSecretKey: SECRET}));

    const query: Record<string, unknown> = {
      shop: 'shop.myshopify.com',
      timestamp: ['1700000000', '1700000001'],
      hmac: 'unused',
    };

    await expect(
      shopify.utils.validateHmac(query as any, {
        signator: 'admin' as HMACSignator,
      }),
    ).rejects.toBeInstanceOf(ShopifyErrors.InvalidHmacError);
  });

  test.each(['hmac', 'shop', 'signature', 'timestamp'])(
    'rejects a plain object with an array-valued %s',
    async (param) => {
      const shopify = shopifyApi(testConfig({apiSecretKey: SECRET}));

      const query: Record<string, unknown> = {
        shop: 'shop.myshopify.com',
        timestamp: String(getCurrentTimeInSec() - 30),
        signature: 'unused',
      };
      query[param] = ['first-value', 'second-value'];

      await expect(
        shopify.utils.validateHmac(query as any, options),
      ).rejects.toThrow('must not appear more than once');
    },
  );

  test('authenticates a legitimate single-valued App Proxy request', async () => {
    const shopify = shopifyApi(testConfig({apiSecretKey: SECRET}));

    const timestamp = String(getCurrentTimeInSec() - 30);
    const query: Record<string, string> = {
      shop: 'shop.myshopify.com',
      timestamp,
    };
    const canonical = `shop=shop.myshopify.comtimestamp=${timestamp}`;
    query.signature = createHmacSignature(canonical, SECRET);

    await expect(shopify.utils.validateHmac(query, options)).resolves.toBe(
      true,
    );
  });

  test('authenticates a plain object with a repeated application param', async () => {
    const shopify = shopifyApi(testConfig({apiSecretKey: SECRET}));

    const timestamp = String(getCurrentTimeInSec() - 30);
    const query: Record<string, unknown> = {
      shop: 'shop.myshopify.com',
      timestamp,
      extra: ['first', 'second'],
    };
    const canonical = `extra=first,secondshop=shop.myshopify.comtimestamp=${timestamp}`;
    query.signature = createHmacSignature(canonical, SECRET);

    await expect(
      shopify.utils.validateHmac(query as any, options),
    ).resolves.toBe(true);
  });

  test('authenticates a legitimate URLSearchParams App Proxy request', async () => {
    const shopify = shopifyApi(testConfig({apiSecretKey: SECRET}));

    const timestamp = String(getCurrentTimeInSec() - 30);
    const canonical = `shop=shop.myshopify.comtimestamp=${timestamp}`;
    const query = new URLSearchParams({
      shop: 'shop.myshopify.com',
      timestamp,
      signature: createHmacSignature(canonical, SECRET),
    });

    await expect(shopify.utils.validateHmac(query, options)).resolves.toBe(
      true,
    );
  });
});

function createHmacSignature(queryString: string, apiSecretKey: string) {
  return crypto
    .createHmac('sha256', apiSecretKey)
    .update(queryString)
    .digest('hex');
}
