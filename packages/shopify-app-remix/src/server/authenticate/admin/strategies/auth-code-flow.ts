import {
  CookieNotFound,
  GraphqlQueryError,
  HttpResponseError,
  InvalidHmacError,
  InvalidOAuthError,
  Session,
  Shopify,
  ShopifyRestResources,
} from '@shopify/shopify-api';

import type {BasicParams} from '../../../types';
import {
  beginAuth,
  redirectToAuthPage,
  redirectToShopifyOrAppRoot,
  redirectWithExitIframe,
  triggerAfterAuthHook,
  validateShopAndHostParams,
} from '../helpers';
import {AppConfig} from '../../../config-types';
import {getSessionTokenHeader} from '../../helpers';

import {AuthorizationStrategy} from './types';

export class AuthCodeFlowStrategy<
  Resources extends ShopifyRestResources = ShopifyRestResources,
> implements AuthorizationStrategy
{
  protected api: Shopify;
  protected config: AppConfig;
  protected logger: Shopify['logger'];

  public constructor({api, config, logger}: BasicParams) {
    this.api = api;
    this.config = config;
    this.logger = logger;
  }

  public async respondToOAuthRequests(request: Request): Promise<void | never> {
    const {api, config} = this;

    const url = new URL(request.url);
    const isAuthRequest = url.pathname === config.auth.path;
    const isAuthCallbackRequest = url.pathname === config.auth.callbackPath;

    if (isAuthRequest || isAuthCallbackRequest) {
      const shop = api.utils.sanitizeShop(url.searchParams.get('shop')!);
      if (!shop) throw new Response('Shop param is invalid', {status: 400});

      if (isAuthRequest) {
        throw await this.handleAuthBeginRequest(request, shop);
      } else {
        throw await this.handleAuthCallbackRequest(request, shop);
      }
    }

    if (!getSessionTokenHeader(request)) {
      // This is a document request that doesn't contain a session token. We check if the app is installed.
      // If the app isn't installed, we initiate the OAuth auth code flow.
      // Requests with a header can only happen after the app is installed.
      await this.ensureInstalledOnShop(request);
    }
  }

  public async authenticate(
    request: Request,
    session: Session | undefined,
    shop: string,
  ): Promise<Session | never> {
    const {api, config, logger} = this;

    if (!session) {
      logger.debug('No session found, redirecting to OAuth', {shop});
      await redirectToAuthPage({config, logger, api}, request, shop);
    } else if (!session.isActive(config.scopes)) {
      logger.debug(
        'Found a session, but it has expired, redirecting to OAuth',
        {shop},
      );
      await redirectToAuthPage({config, logger, api}, request, shop);
    }

    logger.debug('Found a valid session', {shop});

    return session!;
  }

  private async ensureInstalledOnShop(request: Request) {
    const {api, config, logger} = this;

    validateShopAndHostParams({api, config, logger}, request);

    const url = new URL(request.url);
    let shop = url.searchParams.get('shop');

    // Ensure app is installed
    logger.debug('Ensuring app is installed on shop', {shop});

    if (!(await this.hasValidOfflineId(request))) {
      logger.info("Could not find a shop, can't authenticate request");
      throw new Response(undefined, {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    const offlineSession = await this.getOfflineSession(request);
    const isEmbedded = url.searchParams.get('embedded') === '1';

    if (!offlineSession) {
      logger.info("Shop hasn't installed app yet, redirecting to OAuth", {
        shop,
      });
      if (isEmbedded) {
        redirectWithExitIframe({api, config, logger}, request, shop!);
      } else {
        throw await beginAuth({api, config, logger}, request, false, shop!);
      }
    }

    shop = shop || offlineSession.shop;

    if (config.isEmbeddedApp && !isEmbedded) {
      try {
        logger.debug('Ensuring offline session is valid before embedding', {
          shop,
        });
        await this.testSession(offlineSession);

        logger.debug('Offline session is still valid, embedding app', {shop});
      } catch (error) {
        await this.handleInvalidOfflineSession(error, request, shop);
      }
    }
  }

  private async handleAuthBeginRequest(
    request: Request,
    shop: string,
  ): Promise<never> {
    const {api, config, logger} = this;

    logger.info('Handling OAuth begin request', {shop});

    // If we're loading from an iframe, we need to break out of it
    if (
      config.isEmbeddedApp &&
      request.headers.get('Sec-Fetch-Dest') === 'iframe'
    ) {
      logger.debug('Auth request in iframe detected, exiting iframe', {shop});
      throw redirectWithExitIframe({api, config, logger}, request, shop);
    } else {
      throw await beginAuth({api, config, logger}, request, false, shop);
    }
  }

  private async handleAuthCallbackRequest(
    request: Request,
    shop: string,
  ): Promise<never> {
    const {api, config, logger} = this;

    logger.info('Handling OAuth callback request');

    try {
      const {session, headers: responseHeaders} = await api.auth.callback({
        rawRequest: request,
      });

      await config.sessionStorage.storeSession(session);

      if (config.useOnlineTokens && !session.isOnline) {
        logger.info('Requesting online access token for offline session');
        await beginAuth({api, config, logger}, request, true, shop);
      }

      await triggerAfterAuthHook<Resources>(
        {api, config, logger},
        session,
        request,
      );

      throw await redirectToShopifyOrAppRoot(
        request,
        {api, config, logger},
        responseHeaders,
      );
    } catch (error) {
      if (error instanceof Response) throw error;

      throw await this.oauthCallbackError(error, request, shop);
    }
  }

  private async getOfflineSession(
    request: Request,
  ): Promise<Session | undefined> {
    const offlineId = await this.getOfflineSessionId(request);
    return this.config.sessionStorage.loadSession(offlineId!);
  }

  private async hasValidOfflineId(request: Request) {
    return Boolean(await this.getOfflineSessionId(request));
  }

  private async getOfflineSessionId(
    request: Request,
  ): Promise<string | undefined> {
    const {api} = this;
    const url = new URL(request.url);
    const shop = url.searchParams.get('shop');

    return shop
      ? api.session.getOfflineId(shop)
      : api.session.getCurrentId({isOnline: false, rawRequest: request});
  }

  private async testSession(session: Session): Promise<void> {
    const {api} = this;

    const client = new api.clients.Graphql({
      session,
    });

    await client.query(`#graphql
      query shopifyAppShopName {
        shop {
          name
        }
      }
    `);
  }

  private async oauthCallbackError(
    error: Error,
    request: Request,
    shop: string,
  ) {
    const {logger} = this;
    logger.error('Error during OAuth callback', {error: error.message});

    if (error instanceof CookieNotFound) {
      return this.handleAuthBeginRequest(request, shop);
    }

    if (
      error instanceof InvalidHmacError ||
      error instanceof InvalidOAuthError
    ) {
      return new Response(undefined, {
        status: 400,
        statusText: 'Invalid OAuth Request',
      });
    }

    return new Response(undefined, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }

  private async handleInvalidOfflineSession(
    error: Error,
    request: Request,
    shop: string,
  ) {
    const {api, logger, config} = this;
    if (error instanceof HttpResponseError) {
      if (error.response.code === 401) {
        logger.info('Shop session is no longer valid, redirecting to OAuth', {
          shop,
        });
        throw await beginAuth({api, config, logger}, request, false, shop);
      } else {
        const message = JSON.stringify(error.response.body, null, 2);
        logger.error(`Unexpected error during session validation: ${message}`, {
          shop,
        });

        throw new Response(undefined, {
          status: error.response.code,
          statusText: error.response.statusText,
        });
      }
    } else if (error instanceof GraphqlQueryError) {
      const context: {[key: string]: string} = {shop};
      if (error.response) {
        context.response = JSON.stringify(error.response);
      }

      logger.error(
        `Unexpected error during session validation: ${error.message}`,
        context,
      );

      throw new Response(undefined, {
        status: 500,
        statusText: 'Internal Server Error',
      });
    }
  }
}
