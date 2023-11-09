import {
  CookieNotFound,
  InvalidHmacError,
  InvalidOAuthError,
  Session,
  ShopifyRestResources,
} from '@shopify/shopify-api';
import {redirect} from '@remix-run/server-runtime';

import type {BasicParams} from '../../../types';
import {AdminApiContext, adminClientFactory} from '../../../clients/admin';
import {
  beginAuth,
  handleClientErrorFactory,
  redirectWithExitIframe,
  renderAppBridge,
} from '../helpers';

export class AuthCodeFlowStrategy<
  Resources extends ShopifyRestResources = ShopifyRestResources,
> {
  async handleRoutes(request: Request, params: BasicParams) {
    await this.handleBouncePageRoute(request, params);
    await this.handleExitIframeRoute(request, params);
    await this.handleOAuthRoutes(request, params);
  }

  async triggerAfterAuthHook(
    params: BasicParams,
    session: Session,
    request: Request,
  ) {
    const {config, logger} = params;
    if (config.hooks.afterAuth) {
      logger.info('Running afterAuth hook');
      await config.hooks.afterAuth({
        session,
        admin: this.createAdminApiContext(request, session, params),
      });
    }
  }

  async redirectToShopifyOrAppRoot(
    request: Request,
    params: BasicParams,
    responseHeaders?: Headers,
  ): Promise<never> {
    const {api} = params;
    const url = new URL(request.url);

    const host = api.utils.sanitizeHost(url.searchParams.get('host')!)!;
    const shop = api.utils.sanitizeShop(url.searchParams.get('shop')!)!;

    const redirectUrl = api.config.isEmbeddedApp
      ? await api.auth.getEmbeddedAppUrl({rawRequest: request})
      : `/?shop=${shop}&host=${encodeURIComponent(host)}`;

    throw redirect(redirectUrl, {headers: responseHeaders});
  }

  createAdminApiContext(
    request: Request,
    session: Session,
    params: BasicParams,
  ): AdminApiContext<Resources> {
    return adminClientFactory<Resources>({
      session,
      params,
      handleClientError: handleClientErrorFactory({
        request,
      }),
    });
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

      await this.triggerAfterAuthHook(params, session, request);

      throw await this.redirectToShopifyOrAppRoot(
        request,
        params,
        responseHeaders,
      );
    } catch (error) {
      if (error instanceof Response) throw error;

      throw await this.oauthCallbackError(params, error, request, shop);
    }
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
}
