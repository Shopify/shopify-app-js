import {
  HttpResponseError,
  InvalidJwtError,
  RequestedTokenType,
  Session,
} from '@shopify/shopify-api';

import {AppConfigArg} from '../../../config-types';
import {BasicParams} from '../../../types';
import {
  respondToInvalidSessionToken,
  invalidateAccessToken,
  getShopFromRequest,
} from '../../helpers';
import {handleClientErrorFactory, triggerAfterAuthHook} from '../helpers';
import {HandleAdminClientError} from '../../../clients';

import {
  AuthorizationStrategy,
  SessionContext,
  OnErrorOptions,
  AuthStrategyFactory,
} from './types';

export const createTokenExchangeStrategy: AuthStrategyFactory<any> = <
  Config extends AppConfigArg,
>(
  params: BasicParams<Config['future']>,
): AuthorizationStrategy => {
  const {api, config, logger} = params;

  async function exchangeToken({
    request,
    shop,
    sessionToken,
    requestedTokenType,
  }: {
    request: Request;
    shop: string;
    sessionToken: string;
    requestedTokenType: RequestedTokenType;
  }): Promise<{session: Session}> {
    try {
      return await api.auth.tokenExchange({
        sessionToken,
        shop,
        requestedTokenType,
      });
    } catch (error) {
      if (
        error instanceof InvalidJwtError ||
        (error instanceof HttpResponseError &&
          error.response.code === 400 &&
          error.response.body?.error === 'invalid_subject_token')
      ) {
        throw respondToInvalidSessionToken({
          params: {api, config, logger},
          request,
          retryRequest: true,
        });
      }

      throw new Response(undefined, {
        status: 500,
        statusText: 'Internal Server Error',
      });
    }
  }

  async function handleAfterAuthHook(
    session: Session,
    request: Request,
    sessionToken: string,
  ) {
    await config.idempotentPromiseHandler.handlePromise({
      promiseFunction: () => {
        return triggerAfterAuthHook(params, session, request, {
          authenticate,
          handleClientError,
        });
      },
      identifier: sessionToken,
    });
  }

  async function authenticate(
    request: Request,
    sessionContext: SessionContext,
  ): Promise<Session> {
    const {shop, session, sessionToken} = sessionContext;

    if (!sessionToken) throw new InvalidJwtError();

    if (!session || !session.isActive(undefined)) {
      logger.info('No valid session found', {shop});
      logger.info('Requesting offline access token', {shop});
      const {session: offlineSession} = await exchangeToken({
        request,
        sessionToken,
        shop,
        requestedTokenType: RequestedTokenType.OfflineAccessToken,
      });

      await config.sessionStorage!.storeSession(offlineSession);

      let newSession = offlineSession;

      if (config.useOnlineTokens) {
        logger.info('Requesting online access token', {shop});
        const {session: onlineSession} = await exchangeToken({
          request,
          sessionToken,
          shop,
          requestedTokenType: RequestedTokenType.OnlineAccessToken,
        });

        await config.sessionStorage!.storeSession(onlineSession);
        newSession = onlineSession;
      }

      logger.debug('Request is valid, loaded session from session token', {
        shop: newSession.shop,
        isOnline: newSession.isOnline,
      });

      try {
        await handleAfterAuthHook(newSession, request, sessionToken);
      } catch (errorOrResponse) {
        if (errorOrResponse instanceof Response) {
          throw errorOrResponse;
        }

        throw new Response(undefined, {
          status: 500,
          statusText: 'Internal Server Error',
        });
      }

      return newSession;
    }

    return session!;
  }

  function handleClientError(request: Request): HandleAdminClientError {
    return handleClientErrorFactory({
      request,
      onError: async ({session, error}: OnErrorOptions) => {
        if (error.response.code === 401) {
          logger.debug('Responding to invalid access token', {
            shop: getShopFromRequest(request),
          });
          await invalidateAccessToken({config, api, logger}, session);

          respondToInvalidSessionToken({
            params: {config, api, logger},
            request,
          });
        }
      },
    });
  }

  return {
    authenticate,
    handleClientError,
  };
};
