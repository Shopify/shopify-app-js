import {HttpResponseError} from '@shopify/shopify-api';

import type {HandleAdminClientError} from '../../../clients/admin/types';
import {HandleClientErrorOptions, OnErrorOptions} from '../strategies/types';
import {OPTIONAL_SCOPES_HEADER} from '../../const';
import { MissingScopesResponse } from 'src/server/types';

export function handleClientErrorFactory({
  request,
  onError,
}: HandleClientErrorOptions): HandleAdminClientError {
  return async function handleClientError({
    error,
    params,
    session,
  }): Promise<never> {
    if (error instanceof HttpResponseError !== true) {
      params.logger.debug(
        `Got a response error from the API: ${error.message}`,
      );
      handleScopesError({request, error, session});
      throw error;
    }

    params.logger.debug(
      `Got an HTTP response error from the API: ${error.message}`,
      {
        code: error.response.code,
        statusText: error.response.statusText,
        body: JSON.stringify(error.response.body),
      },
    );

    if (onError) {
      await onError({request, session, error});
    }

    // forward a minimal copy of the upstream HTTP response instead of an Error:
    throw new Response(JSON.stringify(error.response.body), {
      status: error.response.code,
      headers: {
        'Content-Type': error.response.headers!['Content-Type'] as string,
      },
    });
  };
}

function handleScopesError({request, error}: OnErrorOptions) {
  if (
    error.message.includes('Required access') ||
    error.message.includes('Access denied for')
  ) {
    const optionalScopes = (
      request.headers.get(OPTIONAL_SCOPES_HEADER) ?? ''
    ).split(',');
    const responseContent: MissingScopesResponse = {
      type: 'missingScopes',
      data: {scopes: optionalScopes},
    };
    throw new Response(JSON.stringify(responseContent), {
      status: 500,
    });
  }
}
