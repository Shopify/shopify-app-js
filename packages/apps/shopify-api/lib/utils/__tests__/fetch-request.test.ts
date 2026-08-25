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
