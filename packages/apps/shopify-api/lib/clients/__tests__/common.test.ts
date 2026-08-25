import {LogContent} from '@shopify/admin-api-client';

import {clientLoggerFactory} from '../common';
import {testConfig} from '../../__tests__/test-config';
import * as loggerModule from '../../logger';

// Mock the logger module
jest.mock('../../logger', () => ({
  logger: jest.fn(),
}));

const mockLogger = jest.mocked(loggerModule.logger);
const mockDebug = jest.fn();

describe('clientLoggerFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger.mockReturnValue({
      log: jest.fn(),
      debug: mockDebug,
      info: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      deprecated: jest.fn(),
    });
  });

  describe('when httpRequests logging is enabled', () => {
    const config = testConfig({
      logger: {
        httpRequests: true,
      },
    });

    it('logs HTTP-Response events with serialized response data', () => {
      const loggerFn = clientLoggerFactory(config);

      const realResponse = new Response('{"products": []}', {
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json',
          'x-request-id': 'abc123',
        },
      });

      const httpResponseLog: LogContent = {
        type: 'HTTP-Response',
        content: {
          requestParams: {
            url: 'https://test-shop.myshopify.io/admin/api/2023-10/products.json',
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
          },
          response: realResponse,
        },
      };

      loggerFn(httpResponseLog);

      expect(mockDebug).toHaveBeenCalledWith(
        'Received response for HTTP request',
        {
          requestParams: JSON.stringify(httpResponseLog.content.requestParams),
          response: expect.stringContaining('"status":200'),
        },
      );

      // Verify the response was properly serialized
      const loggedResponse = JSON.parse(mockDebug.mock.calls[0][1].response);
      expect(loggedResponse).toMatchObject({
        status: 200,
        statusText: 'OK',
        ok: true,
        redirected: false,
        type: 'default',
        url: '',
        headers: {
          'content-type': 'application/json',
          'x-request-id': 'abc123',
        },
      });
    });

    it('logs HTTP-Retry events with retry attempt information', () => {
      const loggerFn = clientLoggerFactory(config);

      const retryResponse = new Response('{"error": "Too Many Requests"}', {
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          'retry-after': '2',
        },
      });

      const httpRetryLog: LogContent = {
        type: 'HTTP-Retry',
        content: {
          requestParams: {
            url: 'https://test-shop.myshopify.io/admin/api/2023-10/products.json',
            method: 'POST',
          },
          retryAttempt: 2,
          maxRetries: 3,
          lastResponse: retryResponse,
        },
      };

      loggerFn(httpRetryLog);

      expect(mockDebug).toHaveBeenCalledWith('Retrying HTTP request', {
        requestParams: JSON.stringify(httpRetryLog.content.requestParams),
        retryAttempt: 2,
        maxRetries: 3,
        response: expect.stringContaining('"status":429'),
      });

      // Verify the retry response was properly serialized
      const loggedResponse = JSON.parse(mockDebug.mock.calls[0][1].response);
      expect(loggedResponse).toMatchObject({
        status: 429,
        statusText: 'Too Many Requests',
        ok: false,
        headers: {
          'retry-after': '2',
        },
      });
    });

    it('logs HTTP-Retry events with undefined lastResponse', () => {
      const loggerFn = clientLoggerFactory(config);

      const httpRetryLog: LogContent = {
        type: 'HTTP-Retry',
        content: {
          requestParams: {
            url: 'https://test-shop.myshopify.io/admin/api/2023-10/products.json',
            method: 'GET',
          },
          retryAttempt: 1,
          maxRetries: 3,
          lastResponse: undefined,
        },
      };

      loggerFn(httpRetryLog);

      expect(mockDebug).toHaveBeenCalledWith('Retrying HTTP request', {
        requestParams: JSON.stringify(httpRetryLog.content.requestParams),
        retryAttempt: 1,
        maxRetries: 3,
        response: 'undefined',
      });
    });

    it('logs GraphQL deprecation notices', () => {
      const loggerFn = clientLoggerFactory(config);

      const graphqlDeprecationLog: LogContent = {
        type: 'HTTP-Response-GraphQL-Deprecation-Notice',
        content: {
          requestParams: {
            url: 'https://test-shop.myshopify.io/admin/api/2023-10/graphql.json',
            method: 'POST',
            body: JSON.stringify({
              query:
                'query { products(first: 10) { edges { node { id title } } } }',
            }),
          },
          deprecationNotice:
            'Field `Product.handle` is deprecated. Use `Product.slug` instead.',
        },
      };

      loggerFn(graphqlDeprecationLog);

      expect(mockDebug).toHaveBeenCalledWith(
        'Received response containing Deprecated GraphQL Notice',
        {
          requestParams: JSON.stringify(
            graphqlDeprecationLog.content.requestParams,
          ),
          deprecationNotice:
            'Field `Product.handle` is deprecated. Use `Product.slug` instead.',
        },
      );
    });

    it('logs unknown event types using default case', () => {
      const loggerFn = clientLoggerFactory(config);

      const unknownLog: LogContent = {
        type: 'HTTP-Unknown' as any,
        content: 'Some unknown log content',
      };

      loggerFn(unknownLog);

      expect(mockDebug).toHaveBeenCalledWith(
        'HTTP request event: Some unknown log content',
      );
    });

    it('handles responses without headers.entries method', () => {
      const loggerFn = clientLoggerFactory(config);

      // Create a response-like object without headers.entries method
      const responseWithoutEntries = {
        status: 200,
        statusText: 'OK',
        ok: true,
        redirected: false,
        type: 'basic',
        url: 'https://test-shop.myshopify.io/admin/api/2023-10/products.json',
        headers: {
          'content-type': 'application/json',
          'x-request-id': 'abc123',
        },
      };

      const httpResponseLog: LogContent = {
        type: 'HTTP-Response',
        content: {
          requestParams: {
            url: 'https://test-shop.myshopify.io/admin/api/2023-10/products.json',
            method: 'GET',
          },
          response: responseWithoutEntries,
        },
      };

      loggerFn(httpResponseLog);

      expect(mockDebug).toHaveBeenCalledWith(
        'Received response for HTTP request',
        {
          requestParams: JSON.stringify(httpResponseLog.content.requestParams),
          response: JSON.stringify({
            status: 200,
            statusText: 'OK',
            ok: true,
            redirected: false,
            type: 'basic',
            url: 'https://test-shop.myshopify.io/admin/api/2023-10/products.json',
            headers: {
              'content-type': 'application/json',
              'x-request-id': 'abc123',
            },
          }),
        },
      );
    });

    it('handles responses with no response object', () => {
      const loggerFn = clientLoggerFactory(config);

      const httpResponseLog: LogContent = {
        type: 'HTTP-Response',
        content: {
          requestParams: {
            url: 'https://test-shop.myshopify.io/admin/api/2023-10/products.json',
            method: 'GET',
          },
          response: null,
        },
      };

      loggerFn(httpResponseLog);

      expect(mockDebug).toHaveBeenCalledWith(
        'Received response for HTTP request',
        {
          requestParams: JSON.stringify(httpResponseLog.content.requestParams),
          response: JSON.stringify({error: 'No response object provided'}),
        },
      );
    });

    it('handles malformed response objects that throw during serialization', () => {
      const loggerFn = clientLoggerFactory(config);

      // Mock a response that will throw during destructuring
      const problematicResponse = {
        get status() {
          throw new Error('Cannot access status');
        },
      };

      const httpResponseLog: LogContent = {
        type: 'HTTP-Response',
        content: {
          requestParams: {
            url: 'https://test-shop.myshopify.io/admin/api/2023-10/products.json',
            method: 'GET',
          },
          response: problematicResponse,
        },
      };

      // The serializeResponse function catches the error during destructuring
      // and returns the original object, but JSON.stringify will still throw
      // when trying to serialize the problematic getter
      expect(() => loggerFn(httpResponseLog)).toThrow('Cannot access status');
    });

    it('handles response objects that throw during destructuring but are JSON serializable', () => {
      const loggerFn = clientLoggerFactory(config);

      // Create a response that throws during destructuring but can be JSON.stringify'd
      const problematicResponse = {
        get status() {
          throw new Error('Cannot access status');
        },
        toJSON() {
          return {serialized: 'safely'};
        },
      };

      const httpResponseLog: LogContent = {
        type: 'HTTP-Response',
        content: {
          requestParams: {
            url: 'https://test-shop.myshopify.io/admin/api/2023-10/products.json',
            method: 'GET',
          },
          response: problematicResponse,
        },
      };

      // This should not throw - the serializeResponse catches the destructuring error
      // and returns the original object, which has a toJSON method
      expect(() => loggerFn(httpResponseLog)).not.toThrow();

      expect(mockDebug).toHaveBeenCalledWith(
        'Received response for HTTP request',
        {
          requestParams: JSON.stringify(httpResponseLog.content.requestParams),
          response: JSON.stringify({serialized: 'safely'}),
        },
      );
    });
  });

  describe('credential redaction in debug logs', () => {
    const config = testConfig({
      logger: {
        httpRequests: true,
      },
    });

    it('redacts sensitive headers in tuple-shaped requestParams', () => {
      const loggerFn = clientLoggerFactory(config);

      const httpResponseLog: LogContent = {
        type: 'HTTP-Response',
        content: {
          requestParams: [
            'https://test-shop.myshopify.io/admin/api/2023-10/graphql.json',
            {
              method: 'POST',
              headers: {
                'X-Shopify-Access-Token': 'shpua_secret-admin-token',
                'Content-Type': 'application/json',
              },
              body: '{"query": "{ shop { name } }"}',
            },
          ],
          response: new Response('{}', {status: 200}),
        },
      };

      loggerFn(httpResponseLog);

      const loggedParams = mockDebug.mock.calls[0][1].requestParams;
      expect(loggedParams).not.toContain('shpua_secret-admin-token');

      const parsed = JSON.parse(loggedParams);
      expect(parsed[1].headers['X-Shopify-Access-Token']).toBe('****');
      expect(parsed[1].headers['Content-Type']).toBe('application/json');
      expect(parsed[1].body).toBe('{"query": "{ shop { name } }"}');
    });

    it('redacts sensitive headers regardless of case', () => {
      const loggerFn = clientLoggerFactory(config);

      const httpResponseLog: LogContent = {
        type: 'HTTP-Response',
        content: {
          requestParams: [
            'https://test-shop.myshopify.io/admin/api/2023-10/graphql.json',
            {
              method: 'POST',
              headers: {
                'x-shopify-access-token': 'shpua_lowercase-token',
                AUTHORIZATION: 'Bearer secret-bearer-token',
                Cookie: 'session=secret-cookie-value',
              },
            },
          ],
          response: new Response('{}', {status: 200}),
        },
      };

      loggerFn(httpResponseLog);

      const loggedParams = mockDebug.mock.calls[0][1].requestParams;
      expect(loggedParams).not.toContain('shpua_lowercase-token');
      expect(loggedParams).not.toContain('secret-bearer-token');
      expect(loggedParams).not.toContain('secret-cookie-value');

      const parsed = JSON.parse(loggedParams);
      expect(parsed[1].headers['x-shopify-access-token']).toBe('****');
      expect(parsed[1].headers.AUTHORIZATION).toBe('****');
      expect(parsed[1].headers.Cookie).toBe('****');
    });

    it('redacts storefront token headers', () => {
      const loggerFn = clientLoggerFactory(config);

      const httpResponseLog: LogContent = {
        type: 'HTTP-Response',
        content: {
          requestParams: [
            'https://test-shop.myshopify.io/api/2023-10/graphql.json',
            {
              method: 'POST',
              headers: {
                'Shopify-Storefront-Private-Token': 'shpat_private-token',
                'X-Shopify-Storefront-Access-Token': 'public-storefront-token',
              },
            },
          ],
          response: new Response('{}', {status: 200}),
        },
      };

      loggerFn(httpResponseLog);

      const loggedParams = mockDebug.mock.calls[0][1].requestParams;
      expect(loggedParams).not.toContain('shpat_private-token');
      expect(loggedParams).not.toContain('public-storefront-token');
    });

    it('redacts sensitive headers in object-shaped requestParams', () => {
      const loggerFn = clientLoggerFactory(config);

      const httpResponseLog: LogContent = {
        type: 'HTTP-Response',
        content: {
          requestParams: {
            url: 'https://test-shop.myshopify.io/admin/api/2023-10/products.json',
            method: 'GET',
            headers: {
              'X-Shopify-Access-Token': 'shpua_object-shape-token',
              Accept: 'application/json',
            },
          },
          response: new Response('{}', {status: 200}),
        },
      };

      loggerFn(httpResponseLog);

      const loggedParams = mockDebug.mock.calls[0][1].requestParams;
      expect(loggedParams).not.toContain('shpua_object-shape-token');

      const parsed = JSON.parse(loggedParams);
      expect(parsed.headers['X-Shopify-Access-Token']).toBe('****');
      expect(parsed.headers.Accept).toBe('application/json');
    });

    it('redacts sensitive headers passed as a Headers instance', () => {
      const loggerFn = clientLoggerFactory(config);

      const httpResponseLog: LogContent = {
        type: 'HTTP-Response',
        content: {
          requestParams: [
            'https://test-shop.myshopify.io/admin/api/2023-10/graphql.json',
            {
              method: 'POST',
              headers: new Headers({
                'X-Shopify-Access-Token': 'shpua_headers-instance-token',
                'Content-Type': 'application/json',
              }),
            },
          ],
          response: new Response('{}', {status: 200}),
        },
      };

      loggerFn(httpResponseLog);

      const loggedParams = mockDebug.mock.calls[0][1].requestParams;
      expect(loggedParams).not.toContain('shpua_headers-instance-token');
      expect(loggedParams).toContain('****');
      expect(loggedParams).toContain('application/json');
    });

    it('redacts sensitive headers passed as an array of pairs', () => {
      const loggerFn = clientLoggerFactory(config);

      const httpResponseLog: LogContent = {
        type: 'HTTP-Response',
        content: {
          requestParams: [
            'https://test-shop.myshopify.io/admin/api/2023-10/graphql.json',
            {
              method: 'POST',
              headers: [
                ['X-Shopify-Access-Token', 'shpua_array-shape-token'],
                ['Content-Type', 'application/json'],
              ],
            },
          ],
          response: new Response('{}', {status: 200}),
        },
      };

      loggerFn(httpResponseLog);

      const loggedParams = mockDebug.mock.calls[0][1].requestParams;
      expect(loggedParams).not.toContain('shpua_array-shape-token');
      expect(loggedParams).toContain('****');
      expect(loggedParams).toContain('application/json');
    });

    it('redacts sensitive headers in HTTP-Retry events', () => {
      const loggerFn = clientLoggerFactory(config);

      const httpRetryLog: LogContent = {
        type: 'HTTP-Retry',
        content: {
          requestParams: [
            'https://test-shop.myshopify.io/admin/api/2023-10/graphql.json',
            {
              method: 'POST',
              headers: {'X-Shopify-Access-Token': 'shpua_retry-token'},
            },
          ],
          retryAttempt: 1,
          maxRetries: 3,
          lastResponse: undefined,
        },
      };

      loggerFn(httpRetryLog);

      const loggedParams = mockDebug.mock.calls[0][1].requestParams;
      expect(loggedParams).not.toContain('shpua_retry-token');
      expect(loggedParams).toContain('****');
    });

    it('redacts sensitive headers in GraphQL deprecation notice events', () => {
      const loggerFn = clientLoggerFactory(config);

      const graphqlDeprecationLog: LogContent = {
        type: 'HTTP-Response-GraphQL-Deprecation-Notice',
        content: {
          requestParams: [
            'https://test-shop.myshopify.io/admin/api/2023-10/graphql.json',
            {
              method: 'POST',
              headers: {'X-Shopify-Access-Token': 'shpua_deprecation-token'},
            },
          ],
          deprecationNotice: 'Field is deprecated',
        },
      };

      loggerFn(graphqlDeprecationLog);

      const loggedParams = mockDebug.mock.calls[0][1].requestParams;
      expect(loggedParams).not.toContain('shpua_deprecation-token');
      expect(loggedParams).toContain('****');
    });

    it('redacts sensitive response headers', () => {
      const loggerFn = clientLoggerFactory(config);

      const httpResponseLog: LogContent = {
        type: 'HTTP-Response',
        content: {
          requestParams: [
            'https://test-shop.myshopify.io/admin/api/2023-10/graphql.json',
            {method: 'POST'},
          ],
          response: new Response('{}', {
            status: 200,
            headers: {
              'set-cookie': 'session=secret-session-value',
              'content-type': 'application/json',
            },
          }),
        },
      };

      loggerFn(httpResponseLog);

      const loggedResponse = mockDebug.mock.calls[0][1].response;
      expect(loggedResponse).not.toContain('secret-session-value');

      const parsed = JSON.parse(loggedResponse);
      expect(parsed.headers['set-cookie']).toBe('****');
      expect(parsed.headers['content-type']).toBe('application/json');
    });
  });

  describe('when httpRequests logging is disabled', () => {
    const config = testConfig({
      logger: {
        httpRequests: false,
      },
    });

    it('does not log HTTP-Response events', () => {
      const loggerFn = clientLoggerFactory(config);

      const realResponse = new Response('{"data": "test"}', {
        status: 200,
        statusText: 'OK',
      });

      const httpResponseLog: LogContent = {
        type: 'HTTP-Response',
        content: {
          requestParams: {
            url: 'https://test-shop.myshopify.io/admin/api/2023-10/products.json',
            method: 'GET',
          },
          response: realResponse,
        },
      };

      loggerFn(httpResponseLog);

      expect(mockDebug).not.toHaveBeenCalled();
    });

    it('does not log HTTP-Retry events', () => {
      const loggerFn = clientLoggerFactory(config);

      const retryResponse = new Response('{"error": "Server Error"}', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      const httpRetryLog: LogContent = {
        type: 'HTTP-Retry',
        content: {
          requestParams: {
            url: 'https://test-shop.myshopify.io/admin/api/2023-10/products.json',
            method: 'POST',
          },
          retryAttempt: 1,
          maxRetries: 3,
          lastResponse: retryResponse,
        },
      };

      loggerFn(httpRetryLog);

      expect(mockDebug).not.toHaveBeenCalled();
    });

    it('does not log GraphQL deprecation notices', () => {
      const loggerFn = clientLoggerFactory(config);

      const graphqlDeprecationLog: LogContent = {
        type: 'HTTP-Response-GraphQL-Deprecation-Notice',
        content: {
          requestParams: {
            url: 'https://test-shop.myshopify.io/admin/api/2023-10/graphql.json',
            method: 'POST',
          },
          deprecationNotice: 'Field deprecated',
        },
      };

      loggerFn(graphqlDeprecationLog);

      expect(mockDebug).not.toHaveBeenCalled();
    });

    it('does not log unknown event types', () => {
      const loggerFn = clientLoggerFactory(config);

      const unknownLog: LogContent = {
        type: 'HTTP-Unknown' as any,
        content: 'Some unknown log content',
      };

      loggerFn(unknownLog);

      expect(mockDebug).not.toHaveBeenCalled();
    });
  });

  describe('logger function integration', () => {
    it('calls logger with the correct config', () => {
      const config = testConfig({
        logger: {
          httpRequests: true,
        },
      });

      const loggerFn = clientLoggerFactory(config);

      const realResponse = new Response('{}', {status: 200});

      const httpResponseLog: LogContent = {
        type: 'HTTP-Response',
        content: {
          requestParams: {url: 'test-url', method: 'GET'},
          response: realResponse,
        },
      };

      loggerFn(httpResponseLog);

      expect(mockLogger).toHaveBeenCalledWith(config);
    });
  });
});
