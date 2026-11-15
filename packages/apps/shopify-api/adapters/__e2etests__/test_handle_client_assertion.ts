import {jwtVerify} from 'jose';

// The module behind the `createClientAssertion` export of the package root. The bare specifier
// resolves to the built dist, so the harness would silently test a stale build; the other test
// apps import their sources the same way.
import {createClientAssertion} from '../../lib/auth/client-assertion';

// This runs inside each test app, so the signer is exercised in every runtime we support rather
// than only under Node in the unit suite. Exhaustive input checks live in the unit tests; this
// covers the signing path itself, the claims we promise, and one rejection.
const SHOP = 'E2E-Test-Shop.myshopify.com';
const CANONICAL_AUDIENCE =
  'https://e2e-test-shop.myshopify.com/admin/oauth/access_token';
const CLIENT_ID = 'E2eClientId';
const KID = 'E2eKid';

interface CheckResult {
  testPassed: boolean;
  testFailedDebug: string;
}

export const handleClientAssertionTest = async (): Promise<CheckResult> => {
  const failures: string[] = [];

  try {
    for (const [label, keyParams] of [
      ['ES256', {name: 'ECDSA', namedCurve: 'P-256'}],
      [
        'RS256',
        {
          name: 'RSASSA-PKCS1-v1_5',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
      ],
    ] satisfies [string, EcKeyGenParams | RsaHashedKeyGenParams][]) {
      const {privateKey, publicKey} = (await crypto.subtle.generateKey(
        keyParams,
        false,
        ['sign', 'verify'],
      )) as CryptoKeyPair;

      const assertion = await createClientAssertion({
        shop: SHOP,
        clientId: CLIENT_ID,
        kid: KID,
        privateKey,
      });

      const {payload, protectedHeader} = await jwtVerify(assertion, publicKey, {
        algorithms: [label],
        audience: CANONICAL_AUDIENCE,
        issuer: CLIENT_ID,
        subject: CLIENT_ID,
      });

      if (protectedHeader.alg !== label) {
        failures.push(`${label}: alg was ${protectedHeader.alg}`);
      }
      if (protectedHeader.typ !== 'JWT') {
        failures.push(`${label}: typ was ${protectedHeader.typ}`);
      }
      if (protectedHeader.kid !== KID) {
        failures.push(`${label}: kid was ${protectedHeader.kid}`);
      }
      if (payload.aud !== CANONICAL_AUDIENCE) {
        failures.push(`${label}: aud was ${payload.aud}`);
      }
      if (!Number.isInteger(payload.iat) || !Number.isInteger(payload.exp)) {
        failures.push(`${label}: iat/exp were not integers`);
      }
      if (payload.exp! - payload.iat! !== 60) {
        failures.push(
          `${label}: default lifetime was ${payload.exp! - payload.iat!}`,
        );
      }

      const second = await createClientAssertion({
        shop: SHOP,
        clientId: CLIENT_ID,
        kid: KID,
        privateKey,
      });
      const secondPayload = (await jwtVerify(second, publicKey)).payload;
      if (
        !payload.jti ||
        !secondPayload.jti ||
        payload.jti === secondPayload.jti
      ) {
        failures.push(`${label}: jti was not fresh on the second call`);
      }
    }

    const {privateKey: wrongCurveKey} = (await crypto.subtle.generateKey(
      {name: 'ECDSA', namedCurve: 'P-384'},
      false,
      ['sign', 'verify'],
    )) as CryptoKeyPair;

    let rejectedWrongCurve = false;
    try {
      await createClientAssertion({
        shop: SHOP,
        clientId: CLIENT_ID,
        kid: KID,
        privateKey: wrongCurveKey,
      });
    } catch (_error) {
      rejectedWrongCurve = true;
    }
    if (!rejectedWrongCurve) {
      failures.push('a P-384 key was accepted');
    }
  } catch (error) {
    failures.push(`threw: ${error.message}`);
  }

  return {
    testPassed: failures.length === 0,
    testFailedDebug:
      failures.length === 0
        ? ''
        : JSON.stringify({errorMessageReceived: failures.join('; ')}),
  };
};
