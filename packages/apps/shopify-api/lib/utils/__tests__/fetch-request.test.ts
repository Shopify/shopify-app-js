import {testConfig} from '../../__tests__/test-config';
import {queueMockResponse} from '../../__tests__/test-helper';
import {LogSeverity} from '../../types';
import {fetchRequestFactory} from '../fetch-request';

describe('fetchRequest', () => {
  const domain = 'test.example.io';
  const url = `https://${domain}`;
  const successResponse = {field1: 1, field2: 'value'};

  it('skips logging if logger.httpRequests is false', async () => {
    // GIVEN
    const logFn = jest.fn();
    const config = testConfig({
      logger: {log: logFn, level: LogSeverity.Debug, httpRequests: false},
    });

    queueMockResponse(JSON.stringify(successResponse));

    // WHEN
    const response = await fetchRequestFactory(config)(url);
    const responseBody = await response.json();

    // THEN
    expect(logFn).not.toHaveBeenCalled();
    expect(responseBody).toEqual(successResponse);
    expect({method: 'GET', domain, path: '/'}).toMatchMadeHttpRequest();
  });

  it('skips logging if logger.level is higher than Debug', async () => {
    // GIVEN
    const logFn = jest.fn();
    const config = testConfig({
      logger: {log: logFn, level: LogSeverity.Info, httpRequests: true},
    });

    queueMockResponse(JSON.stringify(successResponse));

    // WHEN
    const response = await fetchRequestFactory(config)(url);
    const responseBody = await response.json();

    // THEN
    expect(logFn).not.toHaveBeenCalled();
    expect(responseBody).toEqual(successResponse);
    expect({method: 'GET', domain, path: '/'}).toMatchMadeHttpRequest();
  });

  it('logs GET requests when configured', async () => {
    // GIVEN
    const logFn = jest.fn();
    const config = testConfig({
      logger: {log: logFn, level: LogSeverity.Debug, httpRequests: true},
    });

    queueMockResponse(JSON.stringify(successResponse));

    // WHEN
    const response = await fetchRequestFactory(config)(url);
    const responseBody = await response.json();

    // THEN
    expect(logFn).toHaveBeenNthCalledWith(
      1,
      LogSeverity.Debug,
      `[shopify-api/DEBUG] Making HTTP request | {method: GET, url: ${url}}`,
    );
    expect(logFn).toHaveBeenNthCalledWith(
      2,
      LogSeverity.Debug,
      `[shopify-api/DEBUG] HTTP request completed | {method: GET, url: ${url}, status: 200}`,
    );
    expect(responseBody).toEqual(successResponse);
    expect({method: 'GET', domain, path: '/'}).toMatchMadeHttpRequest();
  });

  it('logs POST requests with the body when configured', async () => {
    // GIVEN
    const logFn = jest.fn();
    const config = testConfig({
      logger: {log: logFn, level: LogSeverity.Debug, httpRequests: true},
    });

    queueMockResponse(JSON.stringify(successResponse));

    // WHEN
    const requestBody = {
      requestField1: 1,
    };
    const response = await fetchRequestFactory(config)(url, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    const responseBody = await response.json();

    // THEN
    expect(logFn).toHaveBeenNthCalledWith(
      1,
      LogSeverity.Debug,
      `[shopify-api/DEBUG] Making HTTP request | {method: POST, url: ${url}, body: ${JSON.stringify(requestBody)}}`,
    );
    expect(logFn).toHaveBeenNthCalledWith(
      2,
      LogSeverity.Debug,
      `[shopify-api/DEBUG] HTTP request completed | {method: POST, url: ${url}, status: 200}`,
    );
    expect(responseBody).toEqual(successResponse);
    expect({
      method: 'POST',
      domain,
      path: '/',
      data: requestBody,
    }).toMatchMadeHttpRequest();
  });

  it('omits the body from debug logs for OAuth token endpoint requests', async () => {
    // GIVEN
    const logFn = jest.fn();
    const config = testConfig({
      logger: {log: logFn, level: LogSeverity.Debug, httpRequests: true},
    });

    queueMockResponse(JSON.stringify(successResponse));

    // WHEN
    const requestBody = {
      client_id: 'test-api-key',
      client_secret: 'test-client-secret-value',
      code: 'test-authorization-code',
    };
    const tokenUrl = `https://${domain}/admin/oauth/access_token`;
    const response = await fetchRequestFactory(config)(tokenUrl, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    const responseBody = await response.json();

    // THEN
    expect(logFn).toHaveBeenNthCalledWith(
      1,
      LogSeverity.Debug,
      `[shopify-api/DEBUG] Making HTTP request | {method: POST, url: ${tokenUrl}}`,
    );
    expect(logFn).toHaveBeenNthCalledWith(
      2,
      LogSeverity.Debug,
      `[shopify-api/DEBUG] HTTP request completed | {method: POST, url: ${tokenUrl}, status: 200}`,
    );
    logFn.mock.calls.forEach(([_severity, message]) => {
      expect(message).not.toContain('test-client-secret-value');
      expect(message).not.toContain('test-authorization-code');
    });
    expect(responseBody).toEqual(successResponse);
    expect({
      method: 'POST',
      domain,
      path: '/admin/oauth/access_token',
      data: requestBody,
    }).toMatchMadeHttpRequest();
  });

  it.each([
    ['a doubled leading slash', '//admin/oauth/access_token'],
    ['several leading slashes', '////admin/oauth/access_token'],
    ['repeated slashes between segments', '/admin//oauth///access_token'],
    ['a trailing slash', '/admin/oauth/access_token/'],
    ['upper case letters', '/Admin/OAuth/Access_Token'],
    ['percent-encoded letters', '/%61dmin/oauth/access%5Ftoken'],
    ['percent-encoded slashes', '/admin%2Foauth%2Faccess_token'],
    ['a format suffix', '/admin/oauth/access_token.json'],
    ['a path prefix', '/proxy/admin/oauth/access_token'],
    ['the path in the query', '?x=/admin/oauth/access_token'],
    ['the path in the fragment', '#/admin/oauth/access_token'],
    [
      'a percent-encoding that does not decode',
      '/admin/oauth/access%5Ftoken%E0%A4%A',
    ],
  ])(
    'omits the body from debug logs for OAuth token endpoint paths with %s',
    async (_description, path) => {
      // GIVEN
      const logFn = jest.fn();
      const config = testConfig({
        logger: {log: logFn, level: LogSeverity.Debug, httpRequests: true},
      });

      queueMockResponse(JSON.stringify(successResponse));

      // WHEN
      const tokenUrl = `https://${domain}${path}`;
      await fetchRequestFactory(config)(tokenUrl, {
        method: 'POST',
        body: JSON.stringify({
          client_secret: 'test-client-secret-value',
          code: 'test-authorization-code',
        }),
      });

      // THEN
      expect(logFn).toHaveBeenNthCalledWith(
        1,
        LogSeverity.Debug,
        `[shopify-api/DEBUG] Making HTTP request | {method: POST, url: ${tokenUrl}}`,
      );
      logFn.mock.calls.forEach(([_severity, message]) => {
        expect(message).not.toContain('test-client-secret-value');
        expect(message).not.toContain('test-authorization-code');
      });
    },
  );

  it('omits the body from debug logs when the shop domain is empty', async () => {
    // GIVEN
    const logFn = jest.fn();
    const config = testConfig({
      logger: {log: logFn, level: LogSeverity.Debug, httpRequests: true},
    });

    queueMockResponse(JSON.stringify(successResponse));

    // WHEN
    const tokenUrl = 'https:///admin/oauth/access_token';
    await fetchRequestFactory(config)(tokenUrl, {
      method: 'POST',
      body: JSON.stringify({client_secret: 'test-client-secret-value'}),
    });

    // THEN
    expect(logFn).toHaveBeenNthCalledWith(
      1,
      LogSeverity.Debug,
      `[shopify-api/DEBUG] Making HTTP request | {method: POST, url: ${tokenUrl}}`,
    );
  });

  it('logs the body for paths near the OAuth token endpoint', async () => {
    // GIVEN
    const logFn = jest.fn();
    const config = testConfig({
      logger: {log: logFn, level: LogSeverity.Debug, httpRequests: true},
    });

    queueMockResponse(JSON.stringify(successResponse));

    // WHEN
    const nearbyUrl = `https://${domain}/admin/oauth/access_scopes.json`;
    const requestBody = JSON.stringify({requestField1: 1});
    await fetchRequestFactory(config)(nearbyUrl, {
      method: 'POST',
      body: requestBody,
    });

    // THEN
    expect(logFn).toHaveBeenNthCalledWith(
      1,
      LogSeverity.Debug,
      `[shopify-api/DEBUG] Making HTTP request | {method: POST, url: ${nearbyUrl}, body: ${requestBody}}`,
    );
  });

  it('omits the body from debug logs when the URL does not parse', async () => {
    // GIVEN
    const logFn = jest.fn();
    const config = testConfig({
      logger: {log: logFn, level: LogSeverity.Debug, httpRequests: true},
    });

    // WHEN
    const relativeUrl = 'admin/oauth/access_token';
    await expect(
      fetchRequestFactory(config)(relativeUrl, {
        method: 'POST',
        body: JSON.stringify({client_secret: 'test-client-secret-value'}),
      }),
    ).rejects.toThrow();

    // THEN
    expect(logFn).toHaveBeenNthCalledWith(
      1,
      LogSeverity.Debug,
      `[shopify-api/DEBUG] Making HTTP request | {method: POST, url: ${relativeUrl}}`,
    );
    logFn.mock.calls.forEach(([_severity, message]) => {
      expect(message).not.toContain('test-client-secret-value');
    });
  });

  it('logs non-200 response codes', async () => {
    // GIVEN
    const logFn = jest.fn();
    const config = testConfig({
      logger: {log: logFn, level: LogSeverity.Debug, httpRequests: true},
    });

    queueMockResponse(JSON.stringify(successResponse), {statusCode: 400});

    // WHEN
    const response = await fetchRequestFactory(config)(url);
    const responseBody = await response.json();

    // THEN
    expect(logFn).toHaveBeenNthCalledWith(
      1,
      LogSeverity.Debug,
      `[shopify-api/DEBUG] Making HTTP request | {method: GET, url: ${url}}`,
    );
    expect(logFn).toHaveBeenNthCalledWith(
      2,
      LogSeverity.Debug,
      `[shopify-api/DEBUG] HTTP request completed | {method: GET, url: ${url}, status: 400}`,
    );
    expect(responseBody).toEqual(successResponse);
    expect({
      method: 'GET',
      domain,
      path: '/',
    }).toMatchMadeHttpRequest();
  });
});
