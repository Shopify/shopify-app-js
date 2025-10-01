import {
  ApiClient,
  CustomFetchApi,
  ApiClientLogger,
  ApiClientLogContentTypes,
  ApiClientConfig,
} from '@shopify/graphql-client';

export type CustomerAccountApiClientLogContentTypes = ApiClientLogContentTypes;

export type CustomerAccountApiClientConfig = ApiClientConfig & {
  accessToken: string;
  customerAccountId: string;
};

export type CustomerAccountApiClientOptions = Omit<
  CustomerAccountApiClientConfig,
  'headers' | 'apiUrl'
> & {
  retries?: number;
  customFetchApi?: CustomFetchApi;
  logger?: ApiClientLogger<CustomerAccountApiClientLogContentTypes>;
};

export interface CustomerAccountQueries {
  [key: string]: {variables: any; return: any};
  [key: number | symbol]: never;
}
export interface CustomerAccountMutations {
  [key: string]: {variables: any; return: any};
  [key: number | symbol]: never;
}
export type CustomerAccountOperations = CustomerAccountQueries &
  CustomerAccountMutations;

export type CustomerAccountApiClient = ApiClient<
  CustomerAccountApiClientConfig,
  CustomerAccountOperations
>;