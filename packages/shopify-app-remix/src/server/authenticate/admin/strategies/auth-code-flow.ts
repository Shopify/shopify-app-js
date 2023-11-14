import {
  CookieNotFound,
  GraphqlQueryError,
  HttpResponseError,
  InvalidHmacError,
  InvalidOAuthError,
  Session,
  ShopifyRestResources,
} from '@shopify/shopify-api';

import type {BasicParams} from '../../../types';
import {
  beginAuth,
  redirectToAuthPage,
  redirectToShopifyOrAppRoot,
  redirectWithExitIframe,
  renderAppBridge,
  triggerAfterAuthHook,
} from '../helpers';
import {SessionContext} from '../types';

export class AuthCodeFlowStrategy<
  Resources extends ShopifyRestResources = ShopifyRestResources,
> {
  async handleRoutes(request: Request, params: BasicParams) {
    await this.handleBouncePageRoute(request, params);
    await this.handleExitIframeRoute(request, params);
    await this.handleOAuthRoutes(request, params);
  }

  async manageAccessToken(
    sessionContext: SessionContext | undefined,
    shop: string,
    request: Request,
    params: BasicParams,
  ): Promise<SessionContext> {
    const {config, logger} = params;
    if (
      !sessionContext?.session ||
      !sessionContext?.session.isActive(config.scopes)
    ) {
      const debugMessage = sessionContext?.session
        ? 'Found a session, but it has expired, redirecting to OAuth'
        : 'No session found, redirecting to OAuth';
      logger.debug(debugMessage, {shop});
      await redirectToAuthPage(params, request, shop);
    }

    return sessionContext!;
  }

  async ensureInstalledOnShop(request: Request, params: BasicParams) {
    const {api, config, logger} = params;
    const url = new URL(request.url);

    let shop = url.searchParams.get('shop');

    // Ensure app is installed
    logger.debug('Ensuring app is installed on shop', {shop});

    if (!(await this.hasValidOfflineId(request, params))) {
      logger.info("Could not find a shop, can't authenticate request");
      throw new Response(undefined, {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    const offlineSession = await this.getOfflineSession(request, params);
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
        await this.testSession(offlineSession, params);

        logger.debug('Offline session is still valid, embedding app', {shop});
      } catch (error) {
        await this.handleInvalidOfflineSession(
          error,
          {api, logger, config},
          request,
          shop,
        );
      }
    }
  }

  private async getOfflineSession(request: Request, params: BasicParams) {
    const {api, config} = params;
    const url = new URL(request.url);

    const shop = url.searchParams.get('shop');

    const offlineId = shop
      ? api.session.getOfflineId(shop)
      : await api.session.getCurrentId({isOnline: false, rawRequest: request});

    if (!offlineId) {
      return null;
    }

    return config.sessionStorage.loadSession(offlineId);
  }

  private async hasValidOfflineId(request: Request, params: BasicParams) {
    const {api} = params;
    const url = new URL(request.url);

    const shop = url.searchParams.get('shop');

    const offlineId = shop
      ? api.session.getOfflineId(shop)
      : await api.session.getCurrentId({isOnline: false, rawRequest: request});

    return Boolean(offlineId);
  }

  private async handleBouncePageRoute(request: Request, params: BasicParams) {
    const {config, logger} = params;
    const url = new URL(request.url);

    if (url.pathname === config.auth.patchSessionTokenPath) {
      logger.debug('Rendering bounce page');
      throw renderAppBridge(params, request);
    }
  }

  private async handleExitIframeRoute(request: Request, params: BasicParams) {
    const {config, logger} = params;
    const url = new URL(request.url);

    if (url.pathname === config.auth.exitIframePath) {
      const destination = url.searchParams.get('exitIframe')!;

      logger.debug('Rendering exit iframe page', {destination});
      throw renderAppBridge(params, request, {url: destination});
    }
  }

  private async handleOAuthRoutes(request: Request, params: BasicParams) {
    const {api, config} = params;
    const url = new URL(request.url);
    const isAuthRequest = url.pathname === config.auth.path;
    const isAuthCallbackRequest = url.pathname === config.auth.callbackPath;

    if (!isAuthRequest && !isAuthCallbackRequest) return;

    const shop = api.utils.sanitizeShop(url.searchParams.get('shop')!);
    if (!shop) throw new Response('Shop param is invalid', {status: 400});

    if (isAuthRequest)
      throw await this.handleAuthBeginRequest(request, shop, params);

    if (isAuthCallbackRequest) {
      throw await this.handleAuthCallbackRequest(request, shop, params);
    }
  }

  private async handleAuthBeginRequest(
    request: Request,
    shop: string,
    params: BasicParams,
  ): Promise<never> {
    const {api, config, logger} = params;

    logger.info('Handling OAuth begin request');

    logger.debug('OAuth request contained valid shop', {shop});

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
    params: BasicParams,
  ): Promise<never> {
    const {api, config, logger} = params;

    logger.info('Handling OAuth callback request');

    try {
      const {session, headers: responseHeaders} = await api.auth.callback({
        rawRequest: request,
      });

      await config.sessionStorage.storeSession(session);

      if (config.useOnlineTokens && !session.isOnline) {
        logger.info('Requesting online access token for offline session');
        await beginAuth(params, request, true, shop);
      }

      await triggerAfterAuthHook<Resources>(params, session, request);

      throw await redirectToShopifyOrAppRoot(request, params, responseHeaders);
    } catch (error) {
      if (error instanceof Response) throw error;

      throw await this.oauthCallbackError(params, error, request, shop);
    }
  }

  private async testSession(
    session: Session,
    params: BasicParams,
  ): Promise<void> {
    const {api} = params;

    const client = new api.clients.Graphql({
      session,
    });

    await client.query({
      data: `#graphql
        query shopifyAppShopName {
          shop {
            name
          }
        }
      `,
    });
  }

  private async oauthCallbackError(
    params: BasicParams,
    error: Error,
    request: Request,
    shop: string,
  ) {
    const {logger} = params;
    logger.error('Error during OAuth callback', {error: error.message});

    if (error instanceof CookieNotFound) {
      return this.handleAuthBeginRequest(request, shop, params);
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
    params: BasicParams,
    request: Request,
    shop: string,
  ) {
    const {api, logger, config} = params;
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
