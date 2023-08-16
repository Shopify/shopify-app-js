import {shopifyApp} from '../../..';
import {
  APP_URL,
  getThrownResponse,
  testConfig,
} from '../../../__tests__/test-helper';
import {REAUTH_URL_HEADER} from '../../const';

describe('authorize.admin', () => {
  test('Adds CORS headers if OPTIONS request and origin is not the app', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request('http://cdn.shopify.com', {
        method: 'OPTIONS',
        headers: {Origin: 'http://cdn.shopify.com'},
      }),
    );

    // THEN
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
      'Authorization, Content-Type',
    );
    expect(response.headers.get('Access-Control-Expose-Headers')).toBe(
      REAUTH_URL_HEADER,
    );
  });

  test('Does not add CORS headers if OPTIONS request and origin is the app', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(APP_URL, {method: 'OPTIONS'}),
    );

    // THEN
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).not.toBe('*');
    expect(response.headers.get('Access-Control-Allow-Headers')).not.toBe(
      'Authorization, Content-Type',
    );
    expect(response.headers.get('Access-Control-Expose-Headers')).not.toBe(
      REAUTH_URL_HEADER,
    );
  });
});
