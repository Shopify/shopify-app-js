import {
  AllOperations,
  ApiVersion,
  OperationRequest,
  ReturnBody,
} from '@shopify/shopify-api';

type OperationVariables<
  T extends keyof Operations,
  Operations extends AllOperations,
> = T extends keyof Operations
  ? Operations[T]['variables'] extends {[key: string]: never}
    ? {variables?: never}
    : {variables: OperationRequest<Operations, T>['variables']}
  : {variables?: {[key: string]: any} | undefined};

export type GraphQLQueryOptions<
  T extends keyof Operations,
  Operations extends AllOperations,
> = {
  apiVersion?: ApiVersion;
  headers?: {
    [key: string]: any;
  };
  tries?: number;
} & OperationVariables<T, Operations>;

type GraphqlReturnWithJson<T, Operations extends AllOperations> = Omit<
  Response,
  'json'
> & {
  json: () => Promise<ReturnBody<T, Operations>>;
};

export type GraphQLClient<
  T extends keyof Operations,
  Operations extends AllOperations,
> = (
  query: T,
  options?: GraphQLQueryOptions<T, Operations>,
) => Promise<GraphqlReturnWithJson<T, Operations>>;
