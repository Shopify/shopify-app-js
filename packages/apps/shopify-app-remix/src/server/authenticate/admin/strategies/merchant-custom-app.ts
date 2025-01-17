import {
  Session,
  Shopify,
  ShopifyError,
  ShopifyRestResources,
} from '@shopify/shopify-api';

import {AppConfig, AppConfigArg} from '../../../config-types';
import {BasicParams} from '../../../types';
import {ApiConfigWithFutureFlags, ApiFutureFlags} from '../../../future/flags';
import {HandleAdminClientError} from '../../../clients';
import {handleClientErrorFactory} from '../helpers';
import {getShopFromRequest} from '../../helpers';

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

  public async respondToOAuthRequests(request: Request): Promise<void> {
    this.logger.debug('Skipping OAuth request for merchant custom app', {
      shop: getShopFromRequest(request),
    });
  }

  public async authenticate(
    _request: Request,
    sessionContext: SessionContext,
  ): Promise<Session | never> {
    const {shop} = sessionContext;

    this.logger.debug(
      'Building session from configured access token for merchant custom app',
      {shop},
    );
    const session = this.api.session.customAppSession(shop);

    return session;
  }

  public handleClientError(request: Request): HandleAdminClientError {
    return handleClientErrorFactory({
      request,
      onError: async ({error}: OnErrorOptions) => {
        if (error.response.code === 401) {
          this.logger.info(
            'Request failed with 401. Review your API credentials or generate new tokens. https://shopify.dev/docs/apps/build/authentication-authorization/access-token-types/generate-app-access-tokens-admin#rotating-api-credentials-for-admin-created-apps ',
          );
          throw new ShopifyError(
            'Unauthorized: Access token has been revoked.',
          );
        }
      },
    });
  }
}
