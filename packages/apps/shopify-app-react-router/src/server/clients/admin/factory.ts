import {Session} from '@shopify/shopify-api';

import {BasicParams} from '../../types';

import {graphqlClientFactory} from './graphql';
import type {AdminApiContext} from './types';

interface AdminClientOptions {
  params: BasicParams;
  session: Session;
  handleClientError?: (error: any) => Promise<void>;
}

export function adminClientFactory({
  params,
  handleClientError,
  session,
}: AdminClientOptions): AdminApiContext {
  return {
    graphql: graphqlClientFactory({params, session, handleClientError}),
  };
}
