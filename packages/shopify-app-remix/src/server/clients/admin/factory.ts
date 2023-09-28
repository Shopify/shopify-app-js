import {Session, ShopifyRestResources} from '@shopify/shopify-api';

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
  Resources extends ShopifyRestResources = ShopifyRestResources,
>({
  params,
  handleClientError,
  session,
}: RestClientOptions): AdminApiContext<Resources> {
  return {
    rest: restClientFactory<Resources>({
      params,
      session,
      handleClientError,
    }),
    graphql: graphqlClientFactory({params, session, handleClientError}),
  };
}
