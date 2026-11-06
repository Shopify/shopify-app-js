import {ConfigInterface} from '../../base-types';
import {throwFailedRequest} from '../../clients/common';
import {DataType} from '../../clients/types';
import * as ShopifyErrors from '../../error';
import {Session} from '../../session/session';
import {fetchRequestFactory} from '../../utils/fetch-request';
import {sanitizeShop} from '../../utils/shop-validator';

import {createSession} from './create-session';
import {AccessTokenResponse, ClientCredentialsParams} from './types';

const ClientCredentialsGrantType = 'client_credentials';
const JwtBearerClientAssertionType =
  'urn:ietf:params:oauth:client-assertion-type:jwt-bearer';

export type ClientCredentials = (
  params: ClientCredentialsParams,
) => Promise<{session: Session}>;

export function clientCredentials(config: ConfigInterface): ClientCredentials {
  return async ({shop, clientAssertion}: ClientCredentialsParams) => {
    const cleanShop = sanitizeShop(config)(shop, true)!;

    const usesClientAssertion = clientAssertion !== undefined;
    if (usesClientAssertion) {
      validateClientAssertion(clientAssertion);
      validateClientId(config.apiKey);
    }

    const body = usesClientAssertion
      ? {
          client_id: config.apiKey,
          grant_type: ClientCredentialsGrantType,
          client_assertion_type: JwtBearerClientAssertionType,
          client_assertion: clientAssertion,
        }
      : {
          client_id: config.apiKey,
          client_secret: config.apiSecretKey,
          grant_type: ClientCredentialsGrantType,
        };

    const requestConfig = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': DataType.JSON,
        Accept: DataType.JSON,
      },
      // Redirects can forward credentials or repeat a single-use assertion.
      redirect: 'manual' as const,
    };

    const postResponse = await fetchRequestFactory(config)(
      `https://${cleanShop}/admin/oauth/access_token`,
      requestConfig,
    );

    if (wasRedirected(postResponse)) {
      throw new ShopifyErrors.HttpResponseError({
        message:
          'The access token endpoint returned a redirect and the configured fetch implementation ' +
          'followed it. The credentials in this request may have been sent to the redirect target: ' +
          'treat them as exposed and rotate them if necessary, and make sure your setAbstractFetchFunc ' +
          "implementation honours redirect: 'manual'.",
        code: postResponse.status,
        statusText: postResponse.statusText,
      });
    }

    if (isRedirect(postResponse)) {
      throw new ShopifyErrors.HttpResponseError({
        message:
          'The access token endpoint returned a redirect, which this request does not follow. ' +
          'The credentials in this request were not sent to the redirect target. Check the shop ' +
          'domain and any configured domain transformations, and create a new client assertion if ' +
          'you are using one.',
        code: postResponse.status,
        statusText: postResponse.statusText,
      });
    }

    const responseData = await parseTokenResponse(postResponse);

    if (!postResponse.ok) {
      throwFailedRequest(responseData, false, postResponse);
    }

    return {
      session: createSession({
        accessTokenResponse: responseData,
        shop: cleanShop,
        // We need to keep this as an empty string as our template DB schemas have this required
        state: '',
        config,
      }),
    };
  };
}

function validateClientAssertion(
  clientAssertion: unknown,
): asserts clientAssertion is string {
  if (typeof clientAssertion !== 'string' || clientAssertion.trim() === '') {
    throw new ShopifyErrors.MissingRequiredArgument(
      'clientCredentials received an invalid clientAssertion: expected a non-empty JWT string. Omit the field to authenticate with the configured client secret.',
    );
  }
}

// Assertion authentication identifies the app by client_id alone, so an app that left apiKey
// unset (which validateConfig allows for custom store apps) cannot use this path.
function validateClientId(apiKey: unknown): void {
  if (typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new ShopifyErrors.MissingRequiredArgument(
      'clientCredentials requires a non-empty apiKey in the app configuration to authenticate with a client assertion, because it is sent as the client_id.',
    );
  }
}

// A failing endpoint does not have to answer in JSON: a proxy or an error page answers in HTML, and
// `json()` then throws a bare SyntaxError that names neither the request nor the status. The body
// is deliberately left off the error, as it is on the redirect path.
async function parseTokenResponse(
  response: Response,
): Promise<AccessTokenResponse> {
  try {
    return (await response.json()) as AccessTokenResponse;
  } catch (error) {
    if (response.ok) {
      throw error;
    }

    throw new ShopifyErrors.HttpResponseError({
      message:
        `The access token endpoint returned ${response.status} with a body that is not JSON. ` +
        'Check the shop domain and any configured domain transformations: something other than ' +
        'Shopify may have answered the request.',
      code: response.status,
      statusText: response.statusText,
    });
  }
}

// A fetch implementation that ignores `redirect` has already sent the credentials to the redirect
// target by the time it returns. Responses the library can trust set `redirected` to `false` under
// `redirect: 'manual'`; a synthetic response that does not set it at all reads as `undefined`.
function wasRedirected(response: Response): boolean {
  return (response as {redirected?: boolean}).redirected === true;
}

// Runtimes that filter redirects return an opaque response instead of the 3xx itself. It carries no
// status, so the error reports `code: 0` and an empty `statusText` on that path.
function isRedirect(response: Response): boolean {
  return (
    response.type === 'opaqueredirect' ||
    (response.status >= 300 && response.status < 400)
  );
}
