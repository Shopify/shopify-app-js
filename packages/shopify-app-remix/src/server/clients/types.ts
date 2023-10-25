import {
  AllOperations,
  ApiVersion,
  OperationRequest,
  ReturnBody,
} from '@shopify/shopify-api';

export interface GraphQLQueryOptions<T, Operations extends AllOperations> {
  variables?: T extends keyof Operations
    ? OperationRequest<Operations, T>['variables']
    : {[key: string]: any};
  apiVersion?: ApiVersion;
  headers?: {
    [key: string]: any;
  };
  tries?: number;
}

type GraphqlReturnWithJson<T, Operations extends AllOperations> = Omit<
  Response,
  'json'
> & {
  json: () => Promise<ReturnBody<T, Operations>>;
};

export type GraphQLClient<T, Operations extends AllOperations> = (
  query: T,
  options?: GraphQLQueryOptions<T, Operations>,
) => Promise<GraphqlReturnWithJson<T, Operations>>;
