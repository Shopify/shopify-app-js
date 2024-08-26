import type {MatcherFunction} from 'expect';
import {mockTestRequests} from '../../adapters/mock/mock_test_requests';
import {canonicalizeHeaders} from '../../runtime';

interface ExpectRequestParams {
  method: string;
  domain: string;
  path: string;
  query?: string;
  headers?: Record<string, any>;
  data?: string | Record<string, any> | null;
  attempts?: number;
}

export const toMatchMadeHttpRequest: MatcherFunction = ({
  method,
  domain,
  path,
  query = '',
  headers = {},
  data = undefined,
  attempts = 1,
}: ExpectRequestParams) => {
  const searchHeaders = canonicalizeHeaders(headers as any);
  const searchUrl = new URL(
    `https://${domain}${path}${query ? `?${query}` : ''}`,
  );

  const searchQueryItems = Array.from(searchUrl.searchParams.entries()).sort();
  const cleanSearchUrl = searchUrl.toString().split('?')[0];

  let foundMatch = false;

  for (let i = 0; i < attempts; i++) {
    const matchingRequest = mockTestRequests.getRequest();

    if (!matchingRequest) {
      throw new Error(
        `No request was made, but expected ${JSON.stringify(
          {method, domain, path},
          undefined,
          2,
        )}`,
      );
    }

    const requestUrl = new URL(matchingRequest.url);
    const requestQueryItems = Array.from(
      requestUrl.searchParams.entries(),
    ).sort();
    const cleanRequestUrl = requestUrl.toString().split('?')[0];

    expect(matchingRequest).not.toBeNull();
    expect(matchingRequest.method).toEqual(method);
    expect(canonicalizeHeaders(matchingRequest.headers as any)).toMatchObject(
      searchHeaders,
    );
    expect(cleanRequestUrl).toEqual(cleanSearchUrl);
    expect(requestQueryItems).toEqual(searchQueryItems);

    if (data) {
      if (
        typeof data === 'string' ||
        data.constructor.name === 'StringContaining'
      ) {
        expect(matchingRequest.body).toEqual(data);
      } else {
        const requestBody =
          typeof matchingRequest.body === 'string'
            ? JSON.parse(matchingRequest.body)
            : matchingRequest.body;
        expect(requestBody).toMatchObject(data);
      }
    } else {
      expect(matchingRequest.body).toBeFalsy();
    }

    // Check if headers contain dynamic values
    const headerKeys = Object.keys(searchHeaders);
    foundMatch = headerKeys.every((key) => {
      const expectedValue = searchHeaders[key];
      const actualValue = canonicalizeHeaders(matchingRequest.headers as any)[
        key
      ];

      if (Array.isArray(expectedValue) && Array.isArray(actualValue)) {
        return actualValue.some(
          (value) =>
            expectedValue.includes(value) || expect.any(String).test(value),
        );
      } else {
        return (
          actualValue === expectedValue || expect.any(String).test(actualValue)
        );
      }
    });

    if (foundMatch) {
      break;
    }
  }

  return {
    message: () =>
      `Expected request to match ${JSON.stringify({method, domain, path, headers, data})}`,
    pass: foundMatch,
  };
};
