import {ApiVersion} from '@shopify/shopify-api';

interface QueryVariables {
  [key: string]: any;
}

export interface GraphQLQueryOptions {
  variables?: QueryVariables;
  apiVersion?: ApiVersion;
  headers?: {[key: string]: any};
  tries?: number;
}

export type GraphQLClient = (
  query: string,
  options?: GraphQLQueryOptions,
) => Promise<Response>;
