import {decryptString, encryptString} from '../encrypt';
import {getCryptoLib} from '../utils';

it('can encrypt and decrypt a string with a random key and IV', async () => {
  // GIVEN
  const cryptoLib = getCryptoLib();

  const iv = cryptoLib.getRandomValues(new Uint8Array(12));
  const key = await cryptoLib.subtle.generateKey(
    {name: 'AES-GCM', length: 256},
    true,
    ['encrypt', 'decrypt'],
  );

  // WHEN
  const encryptedValue = await encryptString('Test encrypted value', {key, iv});
  const result = await decryptString(encryptedValue, {key, iv});

  // THEN
  expect(encryptedValue).not.toEqual('Test encrypted value');
  expect(result).toEqual('Test encrypted value');
});
