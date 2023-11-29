import {
  HttpResponseError,
  InvalidJwtError,
  RequestedTokenType,
  Session,
  Shopify,
  ShopifyRestResources,
} from '@shopify/shopify-api';
import {AppConfig, AppConfigArg} from 'src/server/config-types';
import {BasicParams} from 'src/server/types';
import {MockApiConfig} from 'src/server/shopify-app';

import {triggerAfterAuthHook} from '../helpers';
import {respondToInvalidSessionToken} from '../../helpers';

import {AuthorizationStrategy, SessionContext} from './types';

export class TokenExchangeStrategy<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
> implements AuthorizationStrategy
{
  protected api: Shopify<MockApiConfig<Config['future']>>;
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

    if (!session /* || session.isExpired() */) {
      logger.info('Requesting offline access token');
      const {session: offlineSession} = await this.exchangeToken({
        request,
        sessionToken,
        shop,
        requestedTokenType: RequestedTokenType.OfflineAccessToken,
      });

      await config.sessionStorage.storeSession(offlineSession);

      let newSession = offlineSession;

      if (config.useOnlineTokens) {
        logger.info('Requesting online access token');
        const {session: onlineSession} = await this.exchangeToken({
          request,
          sessionToken,
          shop,
          requestedTokenType: RequestedTokenType.OnlineAccessToken,
        });

        await config.sessionStorage.storeSession(onlineSession);
        newSession = onlineSession;
      }

      await triggerAfterAuthHook<Resources>(
        {api, config, logger},
        newSession,
        request,
      );

      return newSession;
    }

    return session!;
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
        throw respondToInvalidSessionToken({api, config, logger}, request);
      }
      throw error;
    }
  }
}
