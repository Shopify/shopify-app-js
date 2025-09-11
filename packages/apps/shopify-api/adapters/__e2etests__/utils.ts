import {Headers, canonicalizeHeaders} from '../../runtime/http';
import {ConfigInterface} from '../../lib/base-types';
import {ApiVersion, LogSeverity} from '../../lib/types';
import {AuthScopes} from '../../lib/auth/scopes';
import {Session} from '../../lib';

export function matchHeaders(received: Headers, expected: Headers): boolean {
  let expectedHeadersCorrect = true;
  const canonicalizedReceived = canonicalizeHeaders(received);
  const canonicalizedExpected = canonicalizeHeaders(expected);

  if (Object.keys(canonicalizedExpected).length > 0) {
    for (const [expectedKey, expectedValues] of Object.entries(
      canonicalizedExpected,
    )) {
      expectedHeadersCorrect =
        expectedHeadersCorrect &&
        expectedKey in canonicalizedReceived &&
        received[expectedKey][0].includes(expectedValues[0]);

      if (!expectedHeadersCorrect) return false;
    }
  }
  return expectedHeadersCorrect;
}

export const config: ConfigInterface = {
  apiKey: 'test_key',
  apiSecretKey: 'test_secret_key',
  scopes: new AuthScopes('test_scope'),
  hostName: 'test_host_name',
  hostScheme: 'https',
  apiVersion: ApiVersion.July25,
  isEmbeddedApp: true,
  isCustomStoreApp: false,
  logger: {
    log: () => Promise.resolve(),
    level: LogSeverity.Debug,
    httpRequests: false,
    timestamps: false,
  },
  future: {},
};

export const session = new Session({
  id: 'test_session',
  isOnline: false,
  shop: 'test-shop.myshopify.io',
  state: '1234',
  scope: 'test_scope',
  accessToken: 'test_access_token',
});
