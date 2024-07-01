import {AppConfig, AppConfigArg} from 'src/server/config-types';
import {Session, Shopify, ShopifyRestResources} from '@shopify/shopify-api';
import {BasicParams} from 'src/server/types';
import {
  ApiConfigWithFutureFlags,
  ApiFutureFlags,
} from 'src/server/future/flags';
import {HandleAdminClientError} from 'src/server/clients';

import {handleClientErrorFactory} from '../helpers';

import {AuthorizationStrategy, OnErrorOptions, SessionContext} from './types';

export class MerchantCustomAuth<Config extends AppConfigArg>
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

  public async respondToOAuthRequests(_request: Request): Promise<void> {
    this.logger.debug('Skipping OAuth request for merchant custom app');
  }

  public async authenticate(
    _request: Request,
    sessionContext: SessionContext,
  ): Promise<Session | never> {
    const {shop} = sessionContext;

    this.logger.debug(
      'Building session from configured access token for merchant custom app',
    );
    const session = this.api.session.customAppSession(shop);

    return session;
  }

  public handleClientError(request: Request): HandleAdminClientError {
    // const {api, config, logger} = this;
    return handleClientErrorFactory({
      request,
      onError: async ({error}: OnErrorOptions) => {
        if (error.response.code === 401) {
          // What should we do if we receive a 401 error?
          // This would mean that the access token has been revoked.
        }
      },
    });
  }
}
