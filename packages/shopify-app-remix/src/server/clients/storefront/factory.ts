import {flatHeaders} from '@shopify/shopify-api/runtime';
import {Session} from '@shopify/shopify-api';

import {BasicParams} from '../../types';

import type {StorefrontContext} from '.';

export function storefrontClientFactory({
  params,
  session,
}: {
  params: BasicParams;
  session: Session;
}): StorefrontContext {
  const {api} = params;

  return {
    graphql: async (query, options = {}) => {
      const client = new api.clients.Storefront({
        session,
        apiVersion: options.apiVersion,
      });

      const apiResponse = await client.query(query, {
        variables: options?.variables,
        tries: options?.tries,
        extraHeaders: options?.headers,
      });

      return new Response(JSON.stringify(apiResponse.body), {
        headers: flatHeaders(apiResponse.headers),
      });
    },
  };
}
