import {shopifyApi} from '../../..';
import {testConfig} from '../../../__tests__/test-config';

test('nonce always returns a new 256-bit random hex string', () => {
  const shopify = shopifyApi(testConfig());

  const firstNonce = shopify.auth.nonce();
  const secondNonce = shopify.auth.nonce();

  expect(firstNonce).toMatch(/^[a-f0-9]{64}$/);
  expect(secondNonce).toMatch(/^[a-f0-9]{64}$/);
  expect(typeof firstNonce).toBe('string');
  expect(typeof secondNonce).toBe('string');
});

test('nonce always returns a unique value', () => {
  const shopify = shopifyApi(testConfig());

  for (let i = 0; i < 100; i++) {
    const first = shopify.auth.nonce();
    const second = shopify.auth.nonce();

    expect(first).not.toEqual(second);
  }
});
