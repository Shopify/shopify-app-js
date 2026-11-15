import {jwtVerify} from 'jose';

import {shopifyApi} from '../../..';
// Imported from the package root on purpose: typed wrappers need these, so the root has to carry
// them.
import type {
  ClientAssertionParams,
  CreateClientAssertionOptions,
} from '../../..';
import {testConfig} from '../../../__tests__/test-config';
import * as ShopifyErrors from '../../../error';
import {createClientAssertion} from '../create-client-assertion';

const SHOP = 'test-shop.myshopify.com';
const AUDIENCE = `https://${SHOP}/admin/oauth/access_token`;
const CLIENT_ID = 'test-client-id';
const KID = 'production-2026-10';
// Five distinct rejections share this message, so the class alone does not say which one fired.
const SUPPORTED_KEY_MESSAGE =
  'createClientAssertion requires a private signing CryptoKey: RSASSA-PKCS1-v1_5 with SHA-256 and a modulus of at least 2048 bits, or ECDSA P-256.';
const SIGN_USAGE_MESSAGE =
  'createClientAssertion requires a CryptoKey that allows the "sign" usage.';

// Test-only keys, generated per test. These never leave the process.
async function rsaKeyPair(modulusLength = 2048): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    false,
    ['sign', 'verify'],
  );
}

async function ecKeyPair(namedCurve = 'P-256'): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey({name: 'ECDSA', namedCurve}, false, [
    'sign',
    'verify',
  ]);
}

function optionsFor(privateKey: CryptoKey): CreateClientAssertionOptions {
  return {shop: SHOP, clientId: CLIENT_ID, kid: KID, privateKey};
}

function paramsFor(privateKey: CryptoKey): ClientAssertionParams {
  return {shop: SHOP, kid: KID, privateKey};
}

describe('createClientAssertion', () => {
  describe('with an RSA key', () => {
    test('creates an RS256 assertion that verifies against the public key', async () => {
      const {privateKey, publicKey} = await rsaKeyPair();

      const assertion = await createClientAssertion(optionsFor(privateKey));

      const {payload, protectedHeader} = await jwtVerify(assertion, publicKey, {
        algorithms: ['RS256'],
        audience: AUDIENCE,
        issuer: CLIENT_ID,
        subject: CLIENT_ID,
      });

      expect(protectedHeader).toEqual({alg: 'RS256', typ: 'JWT', kid: KID});
      expect(payload.aud).toBe(AUDIENCE);
      expect(payload.iss).toBe(CLIENT_ID);
      expect(payload.sub).toBe(CLIENT_ID);
      expect(typeof payload.jti).toBe('string');
      expect(payload.jti).not.toBe('');
    });
  });

  describe('with an EC P-256 key', () => {
    test('creates an ES256 assertion that verifies against the public key', async () => {
      const {privateKey, publicKey} = await ecKeyPair();

      const assertion = await createClientAssertion(optionsFor(privateKey));

      const {payload, protectedHeader} = await jwtVerify(assertion, publicKey, {
        algorithms: ['ES256'],
        audience: AUDIENCE,
      });

      expect(protectedHeader).toEqual({alg: 'ES256', typ: 'JWT', kid: KID});
      expect(payload.iss).toBe(CLIENT_ID);
      expect(payload.sub).toBe(CLIENT_ID);
    });

    test('does not verify against an unrelated public key', async () => {
      const {privateKey} = await ecKeyPair();
      const {publicKey: otherPublicKey} = await ecKeyPair();

      const assertion = await createClientAssertion(optionsFor(privateKey));

      await expect(jwtVerify(assertion, otherPublicKey)).rejects.toThrow();
    });
  });

  describe('claims', () => {
    test('uses integer iat and exp, defaulting to a 60 second lifetime', async () => {
      const nowMs = Date.parse('2026-10-13T12:00:00.500Z');
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(nowMs);

      try {
        const {privateKey, publicKey} = await ecKeyPair();

        const assertion = await createClientAssertion(optionsFor(privateKey));
        const {payload} = await jwtVerify(assertion, publicKey, {
          currentDate: new Date(nowMs),
        });

        expect(payload.iat).toBe(Math.floor(nowMs / 1000));
        expect(Number.isInteger(payload.iat)).toBe(true);
        expect(Number.isInteger(payload.exp)).toBe(true);
        expect(payload.exp! - payload.iat!).toBe(60);
      } finally {
        nowSpy.mockRestore();
      }
    });

    test('sets exactly the header and claims the server requires', async () => {
      const {privateKey, publicKey} = await ecKeyPair();

      const assertion = await createClientAssertion(optionsFor(privateKey));

      const {payload, protectedHeader} = await jwtVerify(assertion, publicKey);

      // A claim the server does not expect is as much of a problem as a missing one, so this is
      // pinned as a set rather than checked member by member.
      expect(Object.keys(protectedHeader).sort()).toEqual([
        'alg',
        'kid',
        'typ',
      ]);
      expect(Object.keys(payload).sort()).toEqual([
        'aud',
        'exp',
        'iat',
        'iss',
        'jti',
        'sub',
      ]);
      // The server compares the audience byte for byte: no trailing slash, no port.
      expect(payload.aud).toBe(AUDIENCE);
      expect(payload.aud).toBe(
        'https://test-shop.myshopify.com/admin/oauth/access_token',
      );
    });

    test('honours a valid custom lifetime', async () => {
      const {privateKey, publicKey} = await ecKeyPair();

      const assertion = await createClientAssertion({
        ...optionsFor(privateKey),
        lifetimeSeconds: 300,
      });

      const {payload} = await jwtVerify(assertion, publicKey);

      expect(payload.exp! - payload.iat!).toBe(300);
    });

    test('creates a new jti on every call, at a fixed clock', async () => {
      const nowMs = Date.parse('2026-10-13T12:00:00Z');
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(nowMs);
      const verifyOptions = {currentDate: new Date(nowMs)};

      try {
        const {privateKey, publicKey} = await ecKeyPair();
        const options = optionsFor(privateKey);

        const first = await jwtVerify(
          await createClientAssertion(options),
          publicKey,
          verifyOptions,
        );
        const second = await jwtVerify(
          await createClientAssertion(options),
          publicKey,
          verifyOptions,
        );

        expect(first.payload.iat).toBe(second.payload.iat);
        expect(first.payload.jti).not.toBe(second.payload.jti);
      } finally {
        nowSpy.mockRestore();
      }
    });
  });

  describe('shop normalisation', () => {
    test.each([
      ['an upper-case label', 'EXAMPLE.myshopify.com'],
      ['a mixed-case label', 'ExAmPlE.MyShopify.Com'],
    ])('lower-cases %s in the audience', async (_label, shop) => {
      const {privateKey, publicKey} = await ecKeyPair();

      const assertion = await createClientAssertion({
        ...optionsFor(privateKey),
        shop,
      });

      const {payload} = await jwtVerify(assertion, publicKey, {
        algorithms: ['ES256'],
        audience: 'https://example.myshopify.com/admin/oauth/access_token',
      });

      expect(payload.aud).toBe(
        'https://example.myshopify.com/admin/oauth/access_token',
      );
    });

    test('rejects a non-ASCII host rather than folding it into another shop', async () => {
      const {privateKey} = await ecKeyPair();
      // U+212A KELVIN SIGN lower-cases to "k", so this names a different, real-looking shop.
      const kelvinShop = 'sho\u212A.myshopify.com';

      expect(kelvinShop.toLowerCase()).toBe('shok.myshopify.com');

      await expect(
        createClientAssertion({...optionsFor(privateKey), shop: kelvinShop}),
      ).rejects.toThrow(/ASCII shop domain/u);
    });

    test('does not change the case of clientId or kid', async () => {
      const {privateKey, publicKey} = await ecKeyPair();

      const assertion = await createClientAssertion({
        shop: 'EXAMPLE.myshopify.com',
        clientId: 'MixedCaseClientId',
        kid: 'MixedCaseKid',
        privateKey,
      });

      const {payload, protectedHeader} = await jwtVerify(assertion, publicKey);

      expect(payload.iss).toBe('MixedCaseClientId');
      expect(payload.sub).toBe('MixedCaseClientId');
      expect(protectedHeader.kid).toBe('MixedCaseKid');
    });
  });

  describe('with invalid input', () => {
    test.each([
      ['a handle without a domain', 'test-shop'],
      ['a non-myshopify domain', 'test-shop.example.com'],
      ['a myshopify.io domain', 'test-shop.myshopify.io'],
      ['a full URL', 'https://test-shop.myshopify.com'],
      ['a domain with a path', 'test-shop.myshopify.com/admin'],
      ['a domain with a trailing slash', 'test-shop.myshopify.com/'],
      ['an empty string', ''],
    ])('rejects %s as the shop', async (_label, shop) => {
      const {privateKey} = await ecKeyPair();

      await expect(
        createClientAssertion({...optionsFor(privateKey), shop}),
      ).rejects.toThrow(ShopifyErrors.InvalidShopError);
    });

    test.each([
      ['an empty clientId', {clientId: ''}],
      ['a blank clientId', {clientId: '   '}],
      ['an empty kid', {kid: ''}],
      ['a blank kid', {kid: '  '}],
    ])('rejects %s', async (_label, overrides) => {
      const {privateKey} = await ecKeyPair();

      await expect(
        createClientAssertion({...optionsFor(privateKey), ...overrides}),
      ).rejects.toThrow(ShopifyErrors.MissingRequiredArgument);
    });

    test.each([
      ['zero', 0],
      ['a negative value', -1],
      ['a non-integer', 60.5],
      ['NaN', NaN],
      ['a value above the maximum', 301],
    ])(
      'rejects %s as the lifetime, without clamping',
      async (_label, value) => {
        const {privateKey} = await ecKeyPair();

        await expect(
          createClientAssertion({
            ...optionsFor(privateKey),
            lifetimeSeconds: value,
          }),
        ).rejects.toThrow(ShopifyErrors.InvalidClientAssertionError);
      },
    );
  });

  describe('with an unsupported key', () => {
    test('rejects a public key', async () => {
      const {publicKey} = await ecKeyPair();

      await expect(
        createClientAssertion(optionsFor(publicKey)),
      ).rejects.toThrow(ShopifyErrors.InvalidClientAssertionError);
      await expect(
        createClientAssertion(optionsFor(publicKey)),
      ).rejects.toThrow(SUPPORTED_KEY_MESSAGE);
    });

    test('rejects an RSA key below 2048 bits', async () => {
      const {privateKey} = await rsaKeyPair(1024);

      await expect(
        createClientAssertion(optionsFor(privateKey)),
      ).rejects.toThrow(ShopifyErrors.InvalidClientAssertionError);
      await expect(
        createClientAssertion(optionsFor(privateKey)),
      ).rejects.toThrow(SUPPORTED_KEY_MESSAGE);
    });

    test.each(['P-384', 'P-521'])(
      'rejects the %s curve',
      async (namedCurve) => {
        const {privateKey} = await ecKeyPair(namedCurve);

        await expect(
          createClientAssertion(optionsFor(privateKey)),
        ).rejects.toThrow(ShopifyErrors.InvalidClientAssertionError);
        await expect(
          createClientAssertion(optionsFor(privateKey)),
        ).rejects.toThrow(SUPPORTED_KEY_MESSAGE);
      },
    );

    test('rejects an RSA-PSS key', async () => {
      const {privateKey} = (await crypto.subtle.generateKey(
        {
          name: 'RSA-PSS',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        false,
        ['sign', 'verify'],
      )) as CryptoKeyPair;

      await expect(
        createClientAssertion(optionsFor(privateKey)),
      ).rejects.toThrow(ShopifyErrors.InvalidClientAssertionError);
      await expect(
        createClientAssertion(optionsFor(privateKey)),
      ).rejects.toThrow(SUPPORTED_KEY_MESSAGE);
    });

    test('rejects an RSA key hashed with SHA-512', async () => {
      const {privateKey} = (await crypto.subtle.generateKey(
        {
          name: 'RSASSA-PKCS1-v1_5',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-512',
        },
        false,
        ['sign', 'verify'],
      )) as CryptoKeyPair;

      await expect(
        createClientAssertion(optionsFor(privateKey)),
      ).rejects.toThrow(ShopifyErrors.InvalidClientAssertionError);
      await expect(
        createClientAssertion(optionsFor(privateKey)),
      ).rejects.toThrow(SUPPORTED_KEY_MESSAGE);
    });

    test('rejects an HMAC secret key', async () => {
      const key = (await crypto.subtle.generateKey(
        {name: 'HMAC', hash: 'SHA-256'},
        false,
        ['sign', 'verify'],
      )) as CryptoKey;

      await expect(createClientAssertion(optionsFor(key))).rejects.toThrow(
        ShopifyErrors.InvalidClientAssertionError,
      );
      await expect(createClientAssertion(optionsFor(key))).rejects.toThrow(
        SUPPORTED_KEY_MESSAGE,
      );
    });

    test('rejects an ECDH key, which cannot sign', async () => {
      const {privateKey} = (await crypto.subtle.generateKey(
        {name: 'ECDH', namedCurve: 'P-256'},
        false,
        ['deriveBits'],
      )) as CryptoKeyPair;

      await expect(
        createClientAssertion(optionsFor(privateKey)),
      ).rejects.toThrow(ShopifyErrors.InvalidClientAssertionError);
      await expect(
        createClientAssertion(optionsFor(privateKey)),
      ).rejects.toThrow(SIGN_USAGE_MESSAGE);
    });

    test('rejects an RSA-OAEP key, which cannot sign', async () => {
      const {privateKey} = (await crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        false,
        ['encrypt', 'decrypt'],
      )) as CryptoKeyPair;

      await expect(
        createClientAssertion(optionsFor(privateKey)),
      ).rejects.toThrow(ShopifyErrors.InvalidClientAssertionError);
      await expect(
        createClientAssertion(optionsFor(privateKey)),
      ).rejects.toThrow(SIGN_USAGE_MESSAGE);
    });

    // What `jose` v5's importPKCS8 and importJWK return on Node: a private key with no `usages`,
    // which the library cannot sign with but which the developer is right to think signs fine.
    test.each([
      ['a Node KeyObject, which has no usages', undefined],
      ['usages that are not an array', 'sign'],
      ['usages without sign', ['verify']],
    ])(
      'rejects an object that is not a CryptoKey: %s',
      async (_label, usages) => {
        const {privateKey} = await ecKeyPair();
        const key = {
          type: privateKey.type,
          algorithm: privateKey.algorithm,
          extractable: privateKey.extractable,
          usages,
        };

        const error = (await createClientAssertion(
          optionsFor(key as unknown as CryptoKey),
        ).catch((caught: Error) => caught)) as Error;

        expect(error).toBeInstanceOf(ShopifyErrors.InvalidClientAssertionError);
        // Naming the fix matters more than naming the problem: the usage message sent the developer
        // to look at an importKey call they never made.
        expect(error.message).toContain('requires a WebCrypto CryptoKey');
        expect(error.message).toContain('crypto.subtle.importKey');
        expect(error.message).toContain('jose v6');
      },
    );

    test.each([
      ['undefined', undefined],
      ['a plain object', {type: 'private'}],
      ['a string', 'not-a-key'],
    ])('rejects %s as the key', async (_label, value) => {
      await expect(
        createClientAssertion(optionsFor(value as unknown as CryptoKey)),
      ).rejects.toThrow(ShopifyErrors.InvalidClientAssertionError);
    });
  });

  describe('as shopify.auth.createClientAssertion', () => {
    test('signs the same assertion as the plain function', async () => {
      const shopify = shopifyApi(testConfig());
      const {privateKey, publicKey} = await ecKeyPair();

      const assertion = await shopify.auth.createClientAssertion(
        optionsFor(privateKey),
      );

      const {payload, protectedHeader} = await jwtVerify(assertion, publicKey, {
        algorithms: ['ES256'],
        audience: AUDIENCE,
        issuer: CLIENT_ID,
        subject: CLIENT_ID,
      });

      expect(protectedHeader).toEqual({alg: 'ES256', typ: 'JWT', kid: KID});
      expect(payload.exp! - payload.iat!).toBe(60);
    });

    test('defaults the client ID to the configured apiKey', async () => {
      const shopify = shopifyApi(testConfig());
      const {privateKey, publicKey} = await ecKeyPair();

      const assertion = await shopify.auth.createClientAssertion(
        paramsFor(privateKey),
      );

      const {payload} = await jwtVerify(assertion, publicKey, {
        issuer: shopify.config.apiKey,
        subject: shopify.config.apiKey,
      });

      expect(payload.iss).toBe(shopify.config.apiKey);
      expect(payload.sub).toBe(shopify.config.apiKey);
    });

    test('prefers an explicit client ID over the configured apiKey', async () => {
      const shopify = shopifyApi(testConfig());
      const {privateKey, publicKey} = await ecKeyPair();

      const assertion = await shopify.auth.createClientAssertion(
        optionsFor(privateKey),
      );

      const {payload} = await jwtVerify(assertion, publicKey);

      expect(payload.iss).toBe(CLIENT_ID);
      expect(payload.iss).not.toBe(shopify.config.apiKey);
    });

    test.each([
      [
        'a myshopify.io shop',
        'test-shop.myshopify.io',
        'test-shop.myshopify.io',
      ],
      ['a shop.dev shop', 'test-shop.shop.dev', 'test-shop.shop.dev'],
      [
        'a shop admin URL',
        'admin.shopify.com/store/test-shop',
        'test-shop.myshopify.com',
      ],
      ['a trailing slash', 'Test-Shop.myshopify.io/', 'test-shop.myshopify.io'],
    ])(
      'accepts %s, like the rest of the library does',
      async (_label, shop, expectedHost) => {
        const shopify = shopifyApi(testConfig());
        const {privateKey, publicKey} = await ecKeyPair();

        const assertion = await shopify.auth.createClientAssertion({
          shop,
          kid: KID,
          privateKey,
        });

        const {payload} = await jwtVerify(assertion, publicKey, {
          audience: `https://${expectedHost}/admin/oauth/access_token`,
        });

        expect(payload.aud).toBe(
          `https://${expectedHost}/admin/oauth/access_token`,
        );
      },
    );

    test('does not apply domain transformations to the audience', async () => {
      const shopify = shopifyApi(
        testConfig({
          domainTransformations: [
            {
              match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.myshopify\.io$/,
              transform: '$1.transformed.myshopify.io',
            },
          ],
        }),
      );
      const {privateKey, publicKey} = await ecKeyPair();

      const assertion = await shopify.auth.createClientAssertion({
        shop: 'test-shop.myshopify.io',
        kid: KID,
        privateKey,
      });

      const {payload} = await jwtVerify(assertion, publicKey);

      // The request goes to the transformed host; the claim names the shop it is for.
      expect(payload.aud).toBe(
        'https://test-shop.myshopify.io/admin/oauth/access_token',
      );
    });

    test('rejects a non-ASCII host rather than folding it into another shop', async () => {
      const shopify = shopifyApi(testConfig());
      const {privateKey} = await ecKeyPair();

      await expect(
        shopify.auth.createClientAssertion({
          ...optionsFor(privateKey),
          shop: 'sho\u212A.myshopify.com',
        }),
      ).rejects.toThrow(/ASCII shop domain/u);
    });

    test('rejects a shop that is not on a trusted domain', async () => {
      const shopify = shopifyApi(testConfig());
      const {privateKey} = await ecKeyPair();

      await expect(
        shopify.auth.createClientAssertion({
          ...optionsFor(privateKey),
          shop: 'test-shop.example.com',
        }),
      ).rejects.toThrow(ShopifyErrors.InvalidShopError);
    });

    test('rejects a blank client ID rather than falling back to the apiKey', async () => {
      const shopify = shopifyApi(testConfig());
      const {privateKey} = await ecKeyPair();

      await expect(
        shopify.auth.createClientAssertion({
          ...optionsFor(privateKey),
          clientId: '',
        }),
      ).rejects.toThrow(ShopifyErrors.MissingRequiredArgument);
    });
  });

  describe('error safety', () => {
    test('keeps key material out of the error it throws', async () => {
      const {privateKey} = await ecKeyPair();

      const error = (await createClientAssertion({
        ...optionsFor(privateKey),
        shop: 'not-a-shop',
      }).catch((caught: Error) => caught)) as Error;

      expect(error).toBeInstanceOf(ShopifyErrors.InvalidShopError);

      const serialized = JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      );
      expect(serialized).not.toContain('CryptoKey');
      expect(serialized).not.toContain('PRIVATE KEY');
    });

    test.each([
      [
        'a PEM string',
        '-----BEGIN PRIVATE KEY-----\nKEY-MATERIAL-MARKER\n-----END PRIVATE KEY-----',
      ],
      [
        'a private JWK',
        {kty: 'EC', crv: 'P-256', x: 'x', y: 'y', d: 'KEY-MATERIAL-MARKER'},
      ],
    ])('keeps %s passed as the key out of the error', async (_label, value) => {
      const error = (await createClientAssertion(
        optionsFor(value as unknown as CryptoKey),
      ).catch((caught: Error) => caught)) as Error;

      expect(error).toBeInstanceOf(ShopifyErrors.InvalidClientAssertionError);

      const serialized = JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      );
      expect(serialized).not.toContain('KEY-MATERIAL-MARKER');
    });
  });
});
