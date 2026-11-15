import {SignJWT} from 'jose';

import {ConfigInterface} from '../../base-types';
import * as ShopifyErrors from '../../error';
import {
  canonicalShopDomain,
  isAsciiShopDomain,
} from '../../utils/shop-validator';

export interface CreateClientAssertionOptions {
  /**
   * The canonical permanent shop domain the assertion is for, e.g. `example.myshopify.com`.
   *
   * The host is lower-cased for the `aud` claim, which has to match the shop's canonical token
   * endpoint exactly.
   */
  shop: string;
  /**
   * The app's client ID, used as both the `iss` and `sub` claims.
   */
  clientId: string;
  /**
   * The identifier the app registered for this key, used as the `kid` header.
   */
  kid: string;
  /**
   * The app's private signing key: RSASSA-PKCS1-v1_5 with SHA-256, or ECDSA P-256.
   *
   * The key is used for this call only. It is never stored, logged, or sent anywhere.
   */
  privateKey: CryptoKey;
  /**
   * How long the assertion is valid for, in seconds. Defaults to 60, maximum 300.
   *
   * Out-of-range values are rejected rather than clamped.
   */
  lifetimeSeconds?: number;
}

const DEFAULT_LIFETIME_SECONDS = 60;
const MAX_LIFETIME_SECONDS = 300;
const MIN_RSA_MODULUS_LENGTH = 2048;
const TOKEN_ENDPOINT_PATH = '/admin/oauth/access_token';
const CANONICAL_SHOP_DOMAIN = /^[a-z0-9][a-z0-9-_]*\.myshopify\.com$/;

const SUPPORTED_KEY_MESSAGE =
  'createClientAssertion requires a private signing CryptoKey: RSASSA-PKCS1-v1_5 with SHA-256 and a modulus of at least 2048 bits, or ECDSA P-256.';

const CRYPTO_KEY_MESSAGE =
  'createClientAssertion requires a WebCrypto CryptoKey. A Node KeyObject is not accepted: import the key with crypto.subtle.importKey, or with jose v6 or later, whose importPKCS8 and importJWK return a CryptoKey.';

/**
 * Creates a signed JWT client assertion for the client credentials grant.
 *
 * The app owns the key; this function signs one assertion with it and keeps nothing. It makes no
 * network request, and it cannot tell whether the key is registered or the app is installed —
 * Shopify checks that when the assertion is exchanged.
 *
 * Each call produces a new `jti`. An assertion is single-use, so a retried token request needs a
 * new call rather than a reused string.
 *
 * This function reads no configuration, so it can sign without a `shopifyApi` object. Apps that
 * have one can call `shopify.auth.createClientAssertion` instead, which fills in the client ID and
 * accepts the same shop domains the rest of the library does.
 */
export async function createClientAssertion({
  shop,
  clientId,
  kid,
  privateKey,
  lifetimeSeconds = DEFAULT_LIFETIME_SECONDS,
}: CreateClientAssertionOptions): Promise<string> {
  return signClientAssertion({
    audience: `https://${validateShop(shop)}${TOKEN_ENDPOINT_PATH}`,
    clientId,
    kid,
    privateKey,
    lifetimeSeconds,
  });
}

export interface ClientAssertionParams extends Omit<
  CreateClientAssertionOptions,
  'clientId'
> {
  /**
   * The app's client ID, used as both the `iss` and `sub` claims.
   *
   * Defaults to the configured `apiKey`, which is what `clientCredentials` sends as the
   * `client_id`. Shopify requires the two to match, so passing a different value here only makes
   * sense when the app signs for a client ID it is not configured with.
   */
  clientId?: string;
}

export type CreateClientAssertion = (
  params: ClientAssertionParams,
) => Promise<string>;

/**
 * Creates a signed JWT client assertion for `shopify.auth.clientCredentials`.
 *
 * Does the same work as {@link createClientAssertion}, with the app's configuration filled in.
 */
export function clientAssertion(
  config: ConfigInterface,
): CreateClientAssertion {
  return async ({shop, clientId, kid, privateKey, lifetimeSeconds}) =>
    signClientAssertion({
      audience: `https://${permanentShopDomain(config, shop)}${TOKEN_ENDPOINT_PATH}`,
      clientId: clientId ?? config.apiKey,
      kid,
      privateKey,
      lifetimeSeconds,
    });
}

interface SignClientAssertionOptions extends Omit<
  CreateClientAssertionOptions,
  'shop'
> {
  audience: string;
}

// Shared by the plain function and by `shopify.auth.createClientAssertion`, which differ only in
// how they arrive at the audience and the client ID.
async function signClientAssertion({
  audience,
  clientId,
  kid,
  privateKey,
  lifetimeSeconds = DEFAULT_LIFETIME_SECONDS,
}: SignClientAssertionOptions): Promise<string> {
  const clientIdentifier = requireNonEmptyString(clientId, 'clientId');
  const keyId = requireNonEmptyString(kid, 'kid');
  const lifetime = validateLifetime(lifetimeSeconds);
  const alg = algorithmFor(privateKey);

  const issuedAt = Math.floor(Date.now() / 1000);

  return new SignJWT()
    .setProtectedHeader({alg, typ: 'JWT', kid: keyId})
    .setIssuer(clientIdentifier)
    .setSubject(clientIdentifier)
    .setAudience(audience)
    .setJti(crypto.randomUUID())
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + lifetime)
    .sign(privateKey);
}

// The configured method accepts every domain the rest of the library accepts, so apps on development
// domains can sign too. It deliberately does not apply `domainTransformations`: the audience
// names the shop the assertion is for, not the host the token request is routed to.
function permanentShopDomain(config: ConfigInterface, shop: string): string {
  requireAsciiShop(shop);

  const canonicalShop = canonicalShopDomain(config)(shop);

  if (!canonicalShop) {
    throw new ShopifyErrors.InvalidShopError(
      'createClientAssertion requires the shop\'s permanent domain, for example "example.myshopify.com".',
    );
  }

  return canonicalShop;
}

// Hostnames are case-insensitive, but the audience has to match the canonical endpoint exactly,
// so the host is normalised here. Nothing else the caller supplies is rewritten.
function validateShop(shop: string): string {
  requireAsciiShop(shop);

  const normalizedShop = typeof shop === 'string' ? shop.toLowerCase() : shop;

  if (
    typeof normalizedShop !== 'string' ||
    !CANONICAL_SHOP_DOMAIN.test(normalizedShop)
  ) {
    throw new ShopifyErrors.InvalidShopError(
      'createClientAssertion requires the canonical permanent shop domain, for example "example.myshopify.com".',
    );
  }

  return normalizedShop;
}

// Lower-casing is the first thing either path does, and it folds some non-ASCII characters into
// ASCII ones, so a caller could name one shop and get an audience for a different, real-looking
// one. Rejected before any normalisation runs.
function requireAsciiShop(shop: string): void {
  if (typeof shop === 'string' && !isAsciiShopDomain(shop)) {
    throw new ShopifyErrors.InvalidShopError(
      'createClientAssertion requires an ASCII shop domain. Lower-casing a non-ASCII character can turn it into a different, valid-looking domain, so it is rejected rather than normalised.',
    );
  }
}

function requireNonEmptyString(value: string, name: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ShopifyErrors.MissingRequiredArgument(
      `createClientAssertion requires a non-empty ${name}.`,
    );
  }

  return value;
}

function validateLifetime(lifetimeSeconds: number): number {
  if (
    typeof lifetimeSeconds !== 'number' ||
    !Number.isInteger(lifetimeSeconds) ||
    lifetimeSeconds <= 0 ||
    lifetimeSeconds > MAX_LIFETIME_SECONDS
  ) {
    throw new ShopifyErrors.InvalidClientAssertionError(
      `createClientAssertion requires lifetimeSeconds to be an integer between 1 and ${MAX_LIFETIME_SECONDS}. Out-of-range values are rejected, not clamped.`,
    );
  }

  return lifetimeSeconds;
}

function algorithmFor(privateKey: CryptoKey): 'RS256' | 'ES256' {
  if (
    !privateKey ||
    typeof privateKey !== 'object' ||
    privateKey.type !== 'private'
  ) {
    throw new ShopifyErrors.InvalidClientAssertionError(SUPPORTED_KEY_MESSAGE);
  }

  // A Node KeyObject, which `jose` v5 returns from importPKCS8 and importJWK, has
  // `type === 'private'` and no `usages` at all. Without this guard the most likely mistake in the
  // library's own documented workflow reports a missing "sign" usage for a key that signs fine.
  if (typeof CryptoKey !== 'undefined' && !(privateKey instanceof CryptoKey)) {
    throw new ShopifyErrors.InvalidClientAssertionError(CRYPTO_KEY_MESSAGE);
  }

  const {usages} = privateKey;
  if (!Array.isArray(usages) || !usages.includes('sign')) {
    throw new ShopifyErrors.InvalidClientAssertionError(
      'createClientAssertion requires a CryptoKey that allows the "sign" usage.',
    );
  }

  const algorithm = privateKey.algorithm;

  switch (algorithm?.name) {
    case 'RSASSA-PKCS1-v1_5': {
      const {hash, modulusLength} = algorithm as RsaHashedKeyAlgorithm;

      if (hash?.name !== 'SHA-256') {
        throw new ShopifyErrors.InvalidClientAssertionError(
          SUPPORTED_KEY_MESSAGE,
        );
      }
      if (
        typeof modulusLength !== 'number' ||
        modulusLength < MIN_RSA_MODULUS_LENGTH
      ) {
        throw new ShopifyErrors.InvalidClientAssertionError(
          SUPPORTED_KEY_MESSAGE,
        );
      }

      return 'RS256';
    }
    case 'ECDSA': {
      const {namedCurve} = algorithm as EcKeyAlgorithm;

      if (namedCurve !== 'P-256') {
        throw new ShopifyErrors.InvalidClientAssertionError(
          SUPPORTED_KEY_MESSAGE,
        );
      }

      return 'ES256';
    }
    default:
      throw new ShopifyErrors.InvalidClientAssertionError(
        SUPPORTED_KEY_MESSAGE,
      );
  }
}
