import {boundary, shopifyApp} from '../../index';
import {testConfig} from '../../../__tests__/test-helper';

describe('Error boundary', () => {
  it('returns a string when handling an ErrorResponse', () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const result = boundary.error(new ErrorResponse());

    // THEN
    expect(result).toEqual('Handling response');
  });

  it('throws an error when handling an unknown error', () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const result = () => boundary.error(new Error());

    // THEN
    expect(result).toThrowError();
  });
});

class ErrorResponse extends Error {}
