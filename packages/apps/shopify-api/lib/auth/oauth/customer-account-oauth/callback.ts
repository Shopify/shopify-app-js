import {ConfigInterface} from '../../../base-types';
import * as ShopifyErrors from '../../../error';
import {logger} from '../../../logger';
import {fetchRequestFactory} from '../../../utils/fetch-request';
import {
  abstractConvertRequest,
  abstractConvertHeaders,
  AdapterHeaders,
  Cookies,
  NormalizedResponse,
} from '../../../../runtime/http';
import type {Session} from '../../../session/session';

import {createCustomerAccountSession} from './create-session';
import {discoverAuthEndpoints} from './discovery';
import type {
  CustomerAccountCallbackParams,
  CustomerAccountTokenExchangeParams,
  CustomerAccountTokenResponse,
} from './types';

export interface CustomerAccountCallbackResponse<T = AdapterHeaders> {
  headers: T;
  session: Session;
}

export type CustomerAccountOAuthCallback = <T = AdapterHeaders>(
  callbackParams: CustomerAccountCallbackParams,
) => Promise<CustomerAccountCallbackResponse<T>>;

export function callback(
  config: ConfigInterface,
): CustomerAccountOAuthCallback {
  return async function callback<T = AdapterHeaders>({
    shop,
    authorizationCode,
    state,
    ...adapterArgs
  }: CustomerAccountCallbackParams): Promise<
    CustomerAccountCallbackResponse<T>
  > {
    const log = logger(config);
    log.info('Completing Customer Account OAuth', {shop});

    const request = await abstractConvertRequest(adapterArgs);
    const response = {} as NormalizedResponse;

    const cookies = new Cookies(request, response, {
      keys: [config.apiSecretKey],
      secure: true,
    });

    // Verify state parameter
    const stateFromCookie = await cookies.getAndVerify(
      'customer_account_state',
    );
    cookies.deleteCookie('customer_account_state');
    if (!stateFromCookie || stateFromCookie !== state) {
      log.error('Invalid state parameter in Customer Account OAuth callback', {
        shop,
      });
      throw new ShopifyErrors.InvalidOAuthError(
        'Invalid state parameter in Customer Account OAuth callback.',
      );
    }

    // Get code verifier from cookie
    const codeVerifier = await cookies.getAndVerify(
      'customer_account_code_verifier',
    );
    cookies.deleteCookie('customer_account_code_verifier');
    if (!codeVerifier) {
      log.error('Could not find Customer Account OAuth code verifier cookie', {
        shop,
      });
      throw new ShopifyErrors.CookieNotFound(
        'Cannot complete Customer Account OAuth process. Could not find code verifier cookie.',
      );
    }

    log.debug(
      'Customer Account OAuth request is valid, requesting access token',
      {shop},
    );

    // Exchange code for token
    const tokenResponse = await exchangeCodeForToken(config)({
      shop,
      authorizationCode,
      codeVerifier,
      redirectUri: '',
      clientId: config.apiKey,
    });

    // Create session
    const session = await createCustomerAccountSession(config)({
      tokenResponse,
      shop,
      state: stateFromCookie,
    });

    log.info('Customer Account OAuth completed successfully', {
      shop,
      sessionId: session.id,
    });

    return {
      headers: (await abstractConvertHeaders(
        cookies.response.headers!,
        adapterArgs,
      )) as T,
      session,
    };
  };
}

export function exchangeCodeForToken(config: ConfigInterface) {
  return async function exchangeCodeForToken(
    params: CustomerAccountTokenExchangeParams,
  ): Promise<CustomerAccountTokenResponse> {
    const {shop, authorizationCode, codeVerifier, redirectUri, clientId} =
      params;

    const log = logger(config);
    const endpoints = await discoverAuthEndpoints(config)(shop);

    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      code: authorizationCode,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    log.debug('Exchanging authorization code for Customer Account tokens', {
      shop,
    });

    const fetchRequest = fetchRequestFactory(config);
    const response = await fetchRequest(endpoints.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    });

    if (!response.ok) {
      throw new ShopifyErrors.HttpRequestError(
        'Failed to exchange authorization code for Customer Account tokens',
      );
    }

    log.debug('Successfully exchanged code for Customer Account tokens', {
      shop,
    });

    const tokenResponse: CustomerAccountTokenResponse = await response.json();
    return tokenResponse;
  };
}
