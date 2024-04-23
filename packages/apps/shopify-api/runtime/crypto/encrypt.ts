import type {EncryptionOptions} from './types';
import {asBase64, fromBase64, getCryptoLib} from './utils';

export function generateIV(): Uint8Array {
  return getCryptoLib().getRandomValues(new Uint8Array(12));
}

export async function encryptString(
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

export async function decryptString(
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
