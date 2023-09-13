import {flatHeaders} from '@shopify/shopify-api/runtime';
import {Session} from '@shopify/shopify-api';

import {BasicParams} from '../../types';
import {GraphQLClient} from '../types';

export function storefrontClientFactory({
  params,
  session,
}: {
  params: BasicParams;
  session: Session;
}): GraphQLClient {
  const {api} = params;

  return async (query, options = {}) => {
    const client = new api.clients.Storefront({
      session,
      apiVersion: options.apiVersion,
    });

    const apiResponse = await client.query({
      data: {query, variables: options?.variables},
      tries: options.tries,
      extraHeaders: options.headers,
    });

    return new Response(JSON.stringify(apiResponse.body), {
      headers: flatHeaders(apiResponse.headers),
    });
  };
}
