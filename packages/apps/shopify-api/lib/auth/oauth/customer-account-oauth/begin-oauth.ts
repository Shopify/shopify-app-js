import {ConfigInterface} from '../../../base-types';
import {logger} from '../../../logger';
import {
  abstractConvertRequest,
  abstractConvertIncomingResponse,
  abstractConvertResponse,
  AdapterResponse,
  Cookies,
} from '../../../../runtime/http';

import {generatePKCEParams, generateRandomState} from './pkce-utils';
import {discoverAuthEndpoints} from './discovery';
import {
  CustomerAccountAuthUrlParams,
  CustomerAccountBeginParams,
} from './types';

export type CustomerAccountOAuthBegin = (
  beginParams: CustomerAccountBeginParams,
) => Promise<AdapterResponse>;

export function begin(config: ConfigInterface): CustomerAccountOAuthBegin {
  return async function begin({
    shop,
    redirectUri,
    clientId,
    scopes = ['openid', 'email', 'customer-account-api:full'],
    ...adapterArgs
  }: CustomerAccountBeginParams): Promise<AdapterResponse> {
    const log = logger(config);
    log.info('Beginning Customer Account OAuth', {shop, redirectUri, clientId});

    const request = await abstractConvertRequest(adapterArgs);
    const response = await abstractConvertIncomingResponse(adapterArgs);

    const cookies = new Cookies(request, response, {
      keys: [config.apiSecretKey],
      secure: true,
    });

    // Generate PKCE parameters
    const pkceParams = await generatePKCEParams();
    const state = generateRandomState();

    // Store PKCE verifier and state in cookies
    await cookies.setAndSign(
      'customer_account_code_verifier',
      pkceParams.codeVerifier,
      {
        expires: new Date(Date.now() + 600000),
        sameSite: 'lax',
        secure: true,
        path: '/',
      },
    );

    await cookies.setAndSign('customer_account_state', state, {
      expires: new Date(Date.now() + 600000),
      sameSite: 'lax',
      secure: true,
      path: '/',
    });

    // Generate authorization URL
    const authUrl = await generateAuthorizationUrl(config)({
      shop,
      redirectUri,
      clientId,
      scopes,
    });

    response.statusCode = 302;
    response.statusText = 'Found';
    response.headers = {
      ...response.headers,
      ...cookies.response.headers!,
      Location: authUrl,
    };

    log.debug(`Customer Account OAuth started, redirecting to ${authUrl}`, {
      shop,
    });

    return abstractConvertResponse(response, adapterArgs);
  };
}

export function generateAuthorizationUrl(config: ConfigInterface) {
  return async function generateAuthorizationUrl(
    params: CustomerAccountAuthUrlParams,
  ): Promise<string> {
    const {
      shop,
      redirectUri,
      clientId,
      scopes = ['openid', 'email', 'customer-account-api:full'],
    } = params;

    const log = logger(config);
    const endpoints = await discoverAuthEndpoints(config)(shop);
    const pkceParams = await generatePKCEParams();
    const state = generateRandomState();

    const authParams = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
      state,
      code_challenge: pkceParams.codeChallenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `${endpoints.authorization_endpoint}?${authParams.toString()}`;

    log.debug('Generated Customer Account authorization URL', {shop, authUrl});

    return authUrl;
  };
}
