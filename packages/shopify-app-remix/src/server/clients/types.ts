import type {
  AllOperations,
  ReturnData,
  FetchResponseBody,
  ApiClientRequestOptions,
  ResponseWithType,
} from '@shopify/admin-api-client';
import {ApiVersion} from '@shopify/shopify-api';

export interface GraphQLQueryOptions<
  Operation extends keyof Operations,
  Operations extends AllOperations,
> {
  variables?: ApiClientRequestOptions<Operation, Operations>['variables'];
  apiVersion?: ApiVersion;
  headers?: {[key: string]: any};
  tries?: number;
}

export type GraphQLClient<Operations extends AllOperations> = <
  Operation extends keyof Operations,
>(
  query: Operation,
  options?: GraphQLQueryOptions<Operation, Operations>,
) => Promise<
  ResponseWithType<FetchResponseBody<ReturnData<Operation, Operations>>>
>;
