import crypto from 'crypto';

import {testConfig} from '../../__tests__/test-config';
import {AuthQuery} from '../../auth/oauth/types';
import * as ShopifyErrors from '../../error';
import {
  HMACSignator,
  getCurrentTimeInSec,
  validateHmacFromRequestFactory,
} from '../hmac-validator';
import {HmacValidationType} from '../types';
import {ShopifyHeader, LogSeverity} from '../../types';
import {type NormalizedRequest} from '../../../runtime';
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

        const queryString = `code=some+code+goes+here&shop=the+shop+URL&state=some+nonce+passed+from+auth&timestamp=${queryParams.timestamp}`;
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
        const queryString = `code=some+code+goes+here&foo=bar&shop=the+shop+URL&state=some+nonce+passed+from+auth&timestamp=${queryParams.timestamp}`;

        const query = {
          ...queryParams,
          foo: 'bar',
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
        const queryString = `code=some+code+goes+here&shop=the+shop+URL&state=some+nonce+passed+from+auth&timestamp=${timestamp}`;
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
        const queryString = `code=some+code+goes+here&shop=the+shop+URL&state=some+nonce+passed+from+auth&timestamp=${timestamp}`;
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
      const queryString = `code=some+code+goes+here&shop=the+shop+URL&state=some+nonce+passed+from+auth&timestamp=${timestamp}`;
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
      const queryString = `code=some+code+goes+here&shop=the+shop+URL&state=some+nonce+passed+from+auth&timestamp=${timestamp}`;
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

describe('validateHmacFromRequest with apiSecretKeyFallback (secret rotation)', () => {
  const primarySecret = 'new_secret_after_rotation';
  const oldSecret = 'old_secret_before_rotation';
  const rawBody = JSON.stringify({id: 12345, topic: 'orders/create'});

  function buildWebhookRequest(signingSecret: string) {
    const rawRequest: NormalizedRequest = {
      method: 'POST',
      url: 'https://my-app.example.com/webhooks',
      headers: {
        [ShopifyHeader.Hmac]: createBase64HmacSignature(rawBody, signingSecret),
        [ShopifyHeader.Topic]: 'orders/create',
        [ShopifyHeader.Domain]: 'test-shop.myshopify.com',
      },
    };

    return {
      type: HmacValidationType.Webhook as const,
      rawBody,
      rawRequest,
    };
  }

  test('accepts a request signed with the primary secret', async () => {
    const shopify = shopifyApi(testConfig({apiSecretKey: primarySecret}));

    const result = await validateHmacFromRequestFactory(shopify.config)(
      buildWebhookRequest(primarySecret),
    );

    expect(result.valid).toBe(true);
  });

  test('accepts a request signed with the fallback secret when configured', async () => {
    const shopify = shopifyApi(
      testConfig({
        apiSecretKey: primarySecret,
        apiSecretKeyFallback: oldSecret,
      }),
    );

    // Signed with the OLD secret — would be rejected without the fallback.
    const result = await validateHmacFromRequestFactory(shopify.config)(
      buildWebhookRequest(oldSecret),
    );

    expect(result.valid).toBe(true);
  });

  test('emits a Warning log when validation succeeds via the fallback secret', async () => {
    const shopify = shopifyApi(
      testConfig({
        apiSecretKey: primarySecret,
        apiSecretKeyFallback: oldSecret,
      }),
    );

    await validateHmacFromRequestFactory(shopify.config)(
      buildWebhookRequest(oldSecret),
    );

    expect(shopify.config.logger.log).toHaveBeenCalledWith(
      LogSeverity.Warning,
      expect.stringContaining('apiSecretKeyFallback'),
    );
  });

  test('does not emit the fallback Warning when the primary secret matches', async () => {
    const shopify = shopifyApi(
      testConfig({
        apiSecretKey: primarySecret,
        apiSecretKeyFallback: oldSecret,
      }),
    );

    const result = await validateHmacFromRequestFactory(shopify.config)(
      buildWebhookRequest(primarySecret),
    );

    expect(result.valid).toBe(true);
    expect(shopify.config.logger.log).not.toHaveBeenCalledWith(
      LogSeverity.Warning,
      expect.stringContaining('apiSecretKeyFallback'),
    );
  });

  test('rejects a request signed with neither the primary nor the fallback secret', async () => {
    const shopify = shopifyApi(
      testConfig({
        apiSecretKey: primarySecret,
        apiSecretKeyFallback: oldSecret,
      }),
    );

    const result = await validateHmacFromRequestFactory(shopify.config)(
      buildWebhookRequest('some_unrelated_secret'),
    );

    expect(result.valid).toBe(false);
  });

  test('rejects the fallback-signed request when no fallback is configured', async () => {
    const shopify = shopifyApi(testConfig({apiSecretKey: primarySecret}));

    const result = await validateHmacFromRequestFactory(shopify.config)(
      buildWebhookRequest(oldSecret),
    );

    expect(result.valid).toBe(false);
  });

  test('accepts a Flow request signed with the fallback secret when configured', async () => {
    const shopify = shopifyApi(
      testConfig({
        apiSecretKey: primarySecret,
        apiSecretKeyFallback: oldSecret,
      }),
    );

    // Flow and fulfillment-service share validateHmacString with webhooks, so
    // the fallback must cover them too. Signed with the OLD secret.
    const result = await validateHmacFromRequestFactory(shopify.config)({
      ...buildWebhookRequest(oldSecret),
      type: HmacValidationType.Flow as const,
    });

    expect(result.valid).toBe(true);
  });
});

function createHmacSignature(queryString: string, apiSecretKey: string) {
  return crypto
    .createHmac('sha256', apiSecretKey)
    .update(queryString)
    .digest('hex');
}

function createBase64HmacSignature(data: string, apiSecretKey: string) {
  return crypto
    .createHmac('sha256', apiSecretKey)
    .update(data, 'utf8')
    .digest('base64');
}
