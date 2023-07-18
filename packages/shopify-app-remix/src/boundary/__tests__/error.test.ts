import {shopifyApp} from '../../index';
import {testConfig} from '../../__tests__/test-helper';

describe('Error boundary', () => {
  it('returns a string when handling a response', () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const result = shopify.boundary.error(new Response());

    // THEN
    expect(result).toEqual('Handling response');
  });

  it('throws an error when handling an unknown error', () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const result = () => shopify.boundary.error(new Error());

    // THEN
    expect(result).toThrowError();
  });
});
