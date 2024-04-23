import {ShopifyError} from '../../lib/error';

import {crypto} from './crypto';
import {HashFormat} from './types';

export async function createSHA256HMAC(
  secret: string,
  payload: string,
  returnFormat: HashFormat = HashFormat.Base64,
): Promise<string> {
  const cryptoLib = getCryptoLib();

  const enc = new TextEncoder();
  const key = await cryptoLib.subtle.importKey(
    'raw',
    enc.encode(secret),
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

export function asHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

const LookupTable =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const ReverseLookupTable = new Uint8Array(256);
for (let i = 0; i < LookupTable.length; i++) {
  ReverseLookupTable[LookupTable.charCodeAt(i)] = i;
}

export function asBase64(buffer: ArrayBuffer): string {
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

export function fromBase64(base64: string): ArrayBuffer {
  let bufferLength = base64.length * 0.75;
  const len = base64.length;
  let i;
  let part = 0;
  let encoded1;
  let encoded2;
  let encoded3;
  let encoded4;

  if (base64[base64.length - 1] === '=') {
    bufferLength--;
    if (base64[base64.length - 2] === '=') {
      bufferLength--;
    }
  }

  const arraybuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arraybuffer);

  for (i = 0; i < len; i += 4) {
    encoded1 = ReverseLookupTable[base64.charCodeAt(i)];
    encoded2 = ReverseLookupTable[base64.charCodeAt(i + 1)];
    encoded3 = ReverseLookupTable[base64.charCodeAt(i + 2)];
    encoded4 = ReverseLookupTable[base64.charCodeAt(i + 3)];

    bytes[part++] = (encoded1 << 2) | (encoded2 >> 4);
    bytes[part++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    bytes[part++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }

  return arraybuffer;
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

export function getCryptoLib(): Crypto {
  return typeof (crypto as any)?.webcrypto === 'undefined'
    ? crypto
    : (crypto as any).webcrypto;
}
