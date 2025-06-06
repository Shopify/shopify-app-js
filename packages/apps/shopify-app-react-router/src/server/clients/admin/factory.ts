import {Session, ShopifyRestResources} from '@shopify/shopify-api';

import type {AppConfigArg} from '../../config-types';
import {BasicParams} from '../../types';

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
