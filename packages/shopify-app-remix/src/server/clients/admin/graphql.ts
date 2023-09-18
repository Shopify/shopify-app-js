import {flatHeaders} from '@shopify/shopify-api/runtime';

import {GraphQLClient, GraphQLQueryOptions} from '../types';

import {AdminClientOptions} from './types';

export type GraphqlQueryFunction = (
  query: string,
  options?: GraphQLQueryOptions,
) => Promise<Response>;

// eslint-disable-next-line no-warning-comments
// TODO: This is actually just a call through to the Shopify API client, but with a different API. We should eventually
// move this over to the library layer. While doing that, we should also allow the apiVersion to be passed into the REST
// client request calls.
export function graphqlClientFactory({
  params,
  handleClientError,
  session,
}: AdminClientOptions): GraphQLClient {
  return async function query(query, options) {
    const client = new params.api.clients.Graphql({
      session,
      apiVersion: options?.apiVersion,
    });

    try {
      // We convert the incoming response to a Response object to bring this client closer to the Remix client.
      const apiResponse = await client.query({
        data: {query, variables: options?.variables},
        tries: options?.tries,
        extraHeaders: options?.headers,
      });

      return new Response(JSON.stringify(apiResponse.body), {
        headers: flatHeaders(apiResponse.headers),
      });
    } catch (error) {
      if (error.response.code === 401) {
        console.log(
          '========> 401 errored request',
          JSON.stringify(session),
          query,
        );
      }

      if (handleClientError) {
        throw await handleClientError({error, params, session});
      }

      throw error;
    }
  };
}
