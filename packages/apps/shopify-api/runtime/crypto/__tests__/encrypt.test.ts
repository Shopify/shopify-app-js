import {decrypt, decryptValue, encrypt, encryptValue} from '../encrypt';
import {getCryptoLib} from '../utils';

let key: CryptoKey;

beforeAll(async () => {
  const cryptoLib = getCryptoLib();
  key = await cryptoLib.subtle.generateKey(
    {name: 'AES-GCM', length: 256},
    true,
    ['encrypt', 'decrypt'],
  );
});

describe('encrypt / decrypt', () => {
  it('can encrypt and decrypt a string with a random key and IV', async () => {
    // GIVEN
    const cryptoLib = getCryptoLib();
    const iv = cryptoLib.getRandomValues(new Uint8Array(12));
    const value = 'Test encrypted value';

    // WHEN
    const encryptedValue = await encrypt(value, {key, iv});
    const result = await decrypt(encryptedValue, {key, iv});

    // THEN
    expect(encryptedValue).not.toEqual(value);
    expect(result).toEqual(value);
  });
});

describe('encryptValue / decryptValue', () => {
  it('can encrypt and decrypt a value with a random key and IV', async () => {
    // GIVEN
    const value = 'Test encrypted value';

    // WHEN
    const encryptedValue = await encryptValue(value, key);
    const result = await decryptValue(encryptedValue, key);

    // THEN
    expect(encryptedValue.startsWith('encrypted#')).toBe(true);
    expect(encryptedValue).not.toEqual(value);
    expect(result).toEqual(value);
  });

  it('fails to decrypt a tampered value', async () => {
    // GIVEN
    const tamperedValue = 'encrypted#not_a_real_cipher';

    // THEN
    await expect(decryptValue(tamperedValue, key)).rejects.toThrow();
  });
});
