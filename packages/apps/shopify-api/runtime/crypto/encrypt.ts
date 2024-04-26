import type {EncryptionOptions} from './types';
import {asBase64, fromBase64, getCryptoLib} from './utils';

export const CIPHER_PREFIX = 'encrypted#';

export function generateIV(): Uint8Array {
  return getCryptoLib().getRandomValues(new Uint8Array(12));
}

export async function encrypt(
  value: string,
  {key, iv}: EncryptionOptions,
): Promise<string> {
  const cryptoLib = getCryptoLib();

  const encrypted = await cryptoLib.subtle.encrypt(
    {name: 'AES-GCM', iv, tagLength: 128},
    key,
    new TextEncoder().encode(value),
  );

  return asBase64(encrypted);
}

export async function decrypt(
  encryptedValue: string,
  {key, iv}: EncryptionOptions,
): Promise<string> {
  const cryptoLib = getCryptoLib();

  const decrypted = await cryptoLib.subtle.decrypt(
    {name: 'AES-GCM', iv},
    key,
    fromBase64(encryptedValue),
  );

  return new TextDecoder().decode(decrypted);
}

export async function encryptValue(value: string, key: CryptoKey) {
  const iv = generateIV();
  const cipher = await encrypt(value, {key, iv});

  return `${CIPHER_PREFIX}${asBase64(iv)}${cipher}`;
}

export async function decryptValue(value: string, key: CryptoKey) {
  if (!value.startsWith(CIPHER_PREFIX)) {
    return value;
  }

  const keyString = value.slice(CIPHER_PREFIX.length);
  const iv = new Uint8Array(fromBase64(keyString.slice(0, 16)));
  const cipher = keyString.slice(16);

  return decrypt(cipher, {key, iv});
}
