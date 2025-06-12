import {authPublicCheckout} from '@shopify/shopify-app-js';

import {toReq} from '../../helpers/to-req';
import {BasicParams} from '../../../types';
import {ensureCORSHeadersFactory} from '../../helpers';

import {AuthenticateExtension, ExtensionContext} from './types';

export function authenticateExtensionFactory(
  params: BasicParams,
  requestType: string,
): AuthenticateExtension {
  return async function authenticateExtension(
    request,
    options = {},
  ): Promise<ExtensionContext> {
    const {logger, config} = params;

    logger.info(`Authenticating ${requestType} request`);

    const result = await authPublicCheckout(toReq(request), {
      clientId: config.apiKey,
      clientSecret: config.apiSecretKey,
    });

    if (!result.ok || !result.jwt?.object) {
      logger.error(result.action as string, {
        reason: result.action,
      });
      throw new Response(result.response.body, {
        status: result.response.status,
      });
    }

    return {
      sessionToken: result.jwt.object,
      cors: ensureCORSHeadersFactory(
        params,
        request,
        options.corsHeaders ?? [],
      ),
    };
  };
}
