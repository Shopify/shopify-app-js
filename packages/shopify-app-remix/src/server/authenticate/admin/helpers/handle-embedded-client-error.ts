import {GraphqlQueryError, HttpResponseError} from '@shopify/shopify-api';
import {redirect} from '@remix-run/server-runtime';

import type {HandleAdminClientError} from '../../../clients/admin/types';

// import {redirectToAuthPage} from './redirect-to-auth-page';

interface HandleClientErrorOptions {
  request: Request;
}

export function handleEmbeddedClientErrorFactory({
  request,
}: HandleClientErrorOptions): HandleAdminClientError {
  return async function handleClientError({
    error,
    params,
    session,
  }): Promise<never> {
    if (error instanceof HttpResponseError !== true) {
      const gqlerror = error.response.errors[0] as any;
      console.log('EXTENSIONS ERROR', gqlerror.extensions.code);
      if (error instanceof GraphqlQueryError && gqlerror.extensions.code) {
        throw new Response(undefined, {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Insufficient-Access': '1',
          },
        });
      }
      params.logger.debug(
        `Got a response error from the API: ${error.message}`,
      );
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

    console.log('error.response', JSON.stringify(error.response));

    if (error.response.code === 401) {
      // 401 unauthorized from core
      // delete access token
      params.config.sessionStorage.deleteSession(session.id);

      const isXhrRequest = request.headers.get('authorization');
      if (isXhrRequest) {
        throw new Response(undefined, {
          status: error.response.code,
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Invalid-Session': '1',
          },
        });
      } else {
        // On document load, delete the access token and reload the app to retrigger
        // token exchange
        throw redirect(request.url);
      }
    }

    if (error.response.code === 403) {
      throw new Response(undefined, {
        status: error.response.code,
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Insufficient-Access': '1',
        },
      });
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
