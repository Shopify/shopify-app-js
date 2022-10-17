import crypto from 'crypto';

import fetchMock, {MockParams} from 'jest-fetch-mock';
import {LATEST_API_VERSION} from '@shopify/shopify-api';
import {MemorySessionStorage} from '@shopify/shopify-api/session-storage/memory';

import {shopifyApp} from '../index';
import {AppConfigParams, ShopifyApp} from '../types';

// eslint-disable-next-line import/no-mutable-exports
export let testConfig: AppConfigParams & {
  api: {
    apiKey: string;
    apiSecretKey: string;
    scopes: string[];
    apiVersion: string;
  };
};
// eslint-disable-next-line import/no-mutable-exports
export let shopify: ShopifyApp;

export const SHOPIFY_HOST = 'totally-real-host';
export const BASE64_HOST = Buffer.from(SHOPIFY_HOST).toString('base64');
export const TEST_SHOP = 'test-shop.myshopify.io';

let currentCall: number;
beforeEach(() => {
  testConfig = {
    auth: {
      path: '/auth',
      callbackPath: '/auth/callback',
    },
    webhooks: {
      path: '/webhooks',
    },
    api: {
      apiKey: 'testApiKey',
      apiSecretKey: 'testApiSecretKey',
      scopes: ['testScope'],
      apiVersion: LATEST_API_VERSION,
      hostName: 'my-test-app.myshopify.io',
      sessionStorage: new MemorySessionStorage(),
    },
  };

  shopify = shopifyApp(testConfig);

  currentCall = 0;
});

export type MockBody =
  | string
  | {
      [key: string]: any;
    };

interface AssertHttpRequestParams {
  method: string;
  url: string | URL;
  body?: MockBody;
  headers?: (string | [string, string])[];
}

export function mockShopifyResponse(body: MockBody, init?: MockParams) {
  fetchMock.mockResponse(
    typeof body === 'string' ? body : JSON.stringify(body),
    init,
  );
}

export function mockShopifyResponses(
  ...responses: ([MockBody] | [MockBody, MockParams])[]
) {
  const parsedResponses: [string, MockParams][] = responses.map(
    ([body, init]) => {
      const bodyString = typeof body === 'string' ? body : JSON.stringify(body);

      return init ? [bodyString, init] : [bodyString, {}];
    },
  );

  fetchMock.mockResponses(...parsedResponses);
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toMatchMadeHttpRequest(): R;
    }
  }
}

expect.extend({
  toMatchMadeHttpRequest({
    method,
    url,
    headers = expect.arrayContaining([]),
    body = expect.objectContaining({}),
  }: AssertHttpRequestParams) {
    const index = currentCall++;

    if (!fetchMock.mock.calls[index]) {
      return {
        pass: false,
        message: () => `Expected a request to be made but none were`,
      };
    }

    const expectedUrl = typeof url === 'string' ? new URL(url) : url;

    const mockCall = fetchMock.mock.calls[index];
    const requestUrl = new URL(mockCall[0] as string);

    const mockBody = mockCall[1]!.body;

    if (body) {
      if (
        typeof body === 'string' ||
        body.constructor.name === 'StringContaining'
      ) {
        expect(mockBody).toEqual(body);
      } else {
        const requestBody =
          typeof mockBody === 'string' ? JSON.parse(mockBody) : mockBody;
        expect(requestBody).toMatchObject(body);
      }
    } else {
      expect(mockBody).toBeFalsy();
    }

    expect(requestUrl).toEqual(expectedUrl);
    expect(mockCall[1]).toMatchObject({method, headers});

    return {
      message: () => `The expected HTTP requests have been seen`,
      pass: true,
    };
  },
});

export function validWebhookHeaders(
  topic: string,
  body: string,
  secretKey: string,
): {[key: string]: string} {
  const hmac = createTestHmac(secretKey, body);

  return {
    'X-Shopify-Topic': topic,
    'X-Shopify-Shop-Domain': TEST_SHOP,
    'X-Shopify-Hmac-Sha256': hmac,
  };
}

export function createTestHmac(secretKey: string, body: string): string {
  return crypto
    .createHmac('sha256', secretKey)
    .update(body, 'utf8')
    .digest('base64');
}
