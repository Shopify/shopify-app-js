import {Session, ShopifyError} from '@shopify/shopify-api';

import {AppConfigArg} from '../../../config-types';
import {BasicParams} from '../../../types';
import {HandleAdminClientError} from '../../../clients';
import {handleClientErrorFactory} from '../helpers';

import {
  AuthorizationStrategy,
  OnErrorOptions,
  SessionContext,
  AuthStrategyFactory,
} from './types';

export const createMerchantCustomAuthStrategy: AuthStrategyFactory<any> = <
  Config extends AppConfigArg,
>(
  params: BasicParams<Config['future']>,
): AuthorizationStrategy => {
  const {api, logger} = params;

  async function authenticate(
    _request: Request,
    sessionContext: SessionContext,
  ): Promise<Session | never> {
    const {shop} = sessionContext;

    logger.debug(
      'Building session from configured access token for merchant custom app',
      {shop},
    );
    const session = api.session.customAppSession(shop);

    return session;
  }

  function handleClientError(request: Request): HandleAdminClientError {
    return handleClientErrorFactory({
      request,
      onError: async ({error}: OnErrorOptions) => {
        if (error.response.code === 401) {
          logger.info(
            'Request failed with 401. Review your API credentials or generate new tokens. https://shopify.dev/docs/apps/build/authentication-authorization/access-token-types/generate-app-access-tokens-admin#rotating-api-credentials-for-admin-created-apps ',
          );
          throw new ShopifyError(
            'Unauthorized: Access token has been revoked.',
          );
        }
      },
    });
  }

  return {
    authenticate,
    handleClientError,
  };
};
