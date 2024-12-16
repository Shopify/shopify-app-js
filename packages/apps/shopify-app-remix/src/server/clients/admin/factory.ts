import {Session, ShopifyRestResources} from '@shopify/shopify-api';
import {AdminOperations} from '@shopify/admin-api-client';

import type {AppConfigArg} from '../../config-types';
import {BasicParams} from '../../types';
import {GraphQLClient} from '../types';

import {graphqlClientFactory} from './graphql';
import {restClientFactory} from './rest';
import type {AdminApiContext} from './types';

interface RestClientOptions {
  params: BasicParams;
  session: Session;
  handleClientError?: (error: any) => Promise<void>;
}

export function adminClientFactory<
  ConfigArg extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
>({
  params,
  handleClientError,
  session,
}: RestClientOptions): AdminApiContext<ConfigArg, Resources> {
  if (params.config.future.removeRest) {
    return {
      graphql: graphqlClientFactory({params, session, handleClientError}),
    } as AdminApiContext<ConfigArg, Resources>;
  }

  return {
    rest: restClientFactory<Resources>({
      params,
      session,
      handleClientError,
    }),
    graphql: graphqlClientFactory({params, session, handleClientError}),
  } as AdminApiContext<ConfigArg, Resources>;
}

export function lazyAdminClientFactory<
  ConfigArg extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
>({
  params,
  getSession,
  handleClientError,
}: {
  params: BasicParams;
  handleClientError?: (error: any) => Promise<void>;
  getSession: () => Promise<Session | undefined>;
}): AdminApiContext<ConfigArg, Resources> {
  const graphql: GraphQLClient<AdminOperations> = async (query, options) => {
    const session = await getSession();

    if (!session) {
      throw new Response('', {status: 401});
    }

    const graphql = graphqlClientFactory({
      params,
      session,
      handleClientError,
    });

    return graphql(query, options);
  };

  return {
    graphql,
  } as AdminApiContext<ConfigArg, Resources>;
}
