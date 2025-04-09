import {
  HttpResponseError,
  InvalidJwtError,
  RequestedTokenType,
  Session,
  Shopify,
  ShopifyRestResources,
} from '@shopify/shopify-api';

import {AppConfig, AppConfigArg} from '../../../config-types';
import {BasicParams} from '../../../types';
import {
  respondToInvalidSessionToken,
  invalidateAccessToken,
  getShopFromRequest,
} from '../../helpers';
import {handleClientErrorFactory, triggerAfterAuthHook} from '../helpers';
import {HandleAdminClientError} from '../../../clients';
import type {
  ApiConfigWithFutureFlags,
  ApiFutureFlags,
} from '../../../future/flags';

import {AuthorizationStrategy, SessionContext, OnErrorOptions} from './types';

export class TokenExchangeStrategy<Config extends AppConfigArg>
  implements AuthorizationStrategy
{
  protected api: Shopify<
    ApiConfigWithFutureFlags<Config['future']>,
    ShopifyRestResources,
    ApiFutureFlags<Config['future']>
  >;

  protected config: AppConfig;
  protected logger: Shopify['logger'];

  public constructor({api, config, logger}: BasicParams<Config['future']>) {
    this.api = api;
    this.config = config;
    this.logger = logger;
  }

  public async respondToOAuthRequests(_request: Request): Promise<void> {}

  public async authenticate(
    request: Request,
    sessionContext: SessionContext,
  ): Promise<Session> {
    const {api, config, logger} = this;
    const {shop, session, sessionToken} = sessionContext;

    if (!sessionToken) throw new InvalidJwtError();

    if (!session || !session.isActive(undefined)) {
      logger.info('No valid session found', {shop});
      logger.info('Requesting offline access token', {shop});
      const {session: offlineSession} = await this.exchangeToken({
        request,
        sessionToken,
        shop,
        requestedTokenType: RequestedTokenType.OfflineAccessToken,
      });

      await config.sessionStorage!.storeSession(offlineSession);

      let newSession = offlineSession;

      if (config.useOnlineTokens) {
        logger.info('Requesting online access token', {shop});
        const {session: onlineSession} = await this.exchangeToken({
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
        await this.handleAfterAuthHook(
          {api, config, logger},
          newSession,
          request,
          sessionToken,
        );
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

  public handleClientError(request: Request): HandleAdminClientError {
    const {api, config, logger} = this;
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

  private async exchangeToken({
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
    const {api, config, logger} = this;

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

  private async handleAfterAuthHook(
    params: BasicParams,
    session: Session,
    request: Request,
    sessionToken: string,
  ) {
    const {config} = params;
    await config.idempotentPromiseHandler.handlePromise({
      promiseFunction: () => {
        return triggerAfterAuthHook(params, session, request, this);
      },
      identifier: sessionToken,
    });
  }
}
