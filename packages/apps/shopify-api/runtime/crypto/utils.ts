import {ShopifyError} from '../../lib/error';

import {HashFormat} from './types';

type HMACSecret = string | ArrayBuffer;

const enc = new TextEncoder();

function getCryptoLib(): Crypto {
  return typeof (crypto as any)?.webcrypto === 'undefined'
    ? crypto
    : (crypto as any).webcrypto;
}

function hmacKeyData(secret: HMACSecret): BufferSource {
  return typeof secret === 'string' ? enc.encode(secret) : secret;
}

export async function createSHA256HMAC(
  secret: HMACSecret,
  payload: string,
  returnFormat: HashFormat = HashFormat.Base64,
): Promise<string> {
  const cryptoLib = getCryptoLib();
  const key = await cryptoLib.subtle.importKey(
    'raw',
    hmacKeyData(secret),
    {
      name: 'HMAC',
      hash: {name: 'SHA-256'},
    },
    false,
    ['sign'],
  );

  const signature = await cryptoLib.subtle.sign(
    'HMAC',
    key,
    enc.encode(payload),
  );
  return returnFormat === HashFormat.Base64
    ? asBase64(signature)
    : asHex(signature);
}

export async function deriveSHA256HMACKey(
  secret: string,
  info: string,
): Promise<ArrayBuffer> {
  const cryptoLib = getCryptoLib();
  const keyMaterial = await cryptoLib.subtle.importKey(
    'raw',
    enc.encode(secret),
    'HKDF',
    false,
    ['deriveBits'],
  );

  return cryptoLib.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(0),
      info: enc.encode(info),
    },
    keyMaterial,
    256,
  );
}

export function asHex(buffer: ArrayBuffer | Uint8Array): string {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

const LookupTable =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
export function asBase64(buffer: ArrayBuffer | Uint8Array): string {
  let output = '';

  const input = new Uint8Array(buffer);
  for (let i = 0; i < input.length; ) {
    const byte1 = input[i++];
    const byte2 = input[i++];
    const byte3 = input[i++];

    const enc1 = byte1 >> 2;
    const enc2 = ((byte1 & 0b00000011) << 4) | (byte2 >> 4);
    let enc3 = ((byte2 & 0b00001111) << 2) | (byte3 >> 6);
    let enc4 = byte3 & 0b00111111;

    if (isNaN(byte2)) {
      enc3 = 64;
    }
    if (isNaN(byte3)) {
      enc4 = 64;
    }

    output +=
      LookupTable[enc1] +
      LookupTable[enc2] +
      LookupTable[enc3] +
      LookupTable[enc4];
  }
  return output;
}

export function hashString(str: string, returnFormat: HashFormat): string {
  const buffer = new TextEncoder().encode(str);

  switch (returnFormat) {
    case HashFormat.Base64:
      return asBase64(buffer);
    case HashFormat.Hex:
      return asHex(buffer);
    default:
      throw new ShopifyError(`Unrecognized hash format '${returnFormat}'`);
  }
}
