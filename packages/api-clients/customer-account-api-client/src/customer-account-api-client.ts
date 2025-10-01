import {
  createGraphQLClient,
  getCurrentSupportedApiVersions,
  validateApiVersion,
  validateDomainAndGetStoreUrl,
  generateGetGQLClientParams,
  generateGetHeaders,
} from '@shopify/graphql-client';

import {
  DEFAULT_CONTENT_TYPE,
  AUTHORIZATION_HEADER,
  CLIENT,
  DEFAULT_CLIENT_VERSION,
} from './constants';
import {
  validateRequiredAccessToken,
  validateRequiredCustomerAccountId,
} from './validations';
import {
  CustomerAccountApiClient,
  CustomerAccountApiClientConfig,
  CustomerAccountApiClientOptions,
  CustomerAccountOperations,
} from './types';

export function createCustomerAccountApiClient({
  storeDomain,
  apiVersion,
  accessToken,
  customerAccountId,
  retries = 0,
  customFetchApi,
  logger,
}: CustomerAccountApiClientOptions): CustomerAccountApiClient {
  const currentSupportedApiVersions = getCurrentSupportedApiVersions();

  const storeUrl = validateDomainAndGetStoreUrl({
    client: CLIENT,
    storeDomain,
  });

  const baseApiVersionValidationParams = {
    client: CLIENT,
    currentSupportedApiVersions,
    logger,
  };

  validateApiVersion({
    ...baseApiVersionValidationParams,
    apiVersion,
  });
  validateRequiredAccessToken(accessToken);
  validateRequiredCustomerAccountId(customerAccountId);

  const apiUrlFormatter = generateApiUrlFormatter(
    storeUrl,
    customerAccountId,
    apiVersion,
    baseApiVersionValidationParams,
  );

  const config: CustomerAccountApiClientConfig = {
    storeDomain: storeUrl,
    apiVersion,
    accessToken,
    customerAccountId,
    headers: {
      'Content-Type': DEFAULT_CONTENT_TYPE,
      Accept: DEFAULT_CONTENT_TYPE,
      [AUTHORIZATION_HEADER]: `Bearer ${accessToken}`,
      'User-Agent': `${CLIENT} v${DEFAULT_CLIENT_VERSION}`,
    },
    apiUrl: apiUrlFormatter(),
  };

  const graphqlClient = createGraphQLClient({
    headers: config.headers,
    url: config.apiUrl,
    retries,
    customFetchApi,
    logger,
  });

  const getHeaders = generateGetHeaders(config);
  const getApiUrl = generateGetApiUrl(config, apiUrlFormatter);

  const getGQLClientParams = generateGetGQLClientParams<CustomerAccountOperations>({
    getHeaders,
    getApiUrl,
  });

  const client: CustomerAccountApiClient = {
    config,
    getHeaders,
    getApiUrl,
    fetch: (...props) => {
      return graphqlClient.fetch(...getGQLClientParams(...props));
    },
    request: (...props) => {
      return graphqlClient.request(...getGQLClientParams(...props));
    },
  };

  return Object.freeze(client);
}

function generateApiUrlFormatter(
  storeUrl: string,
  customerAccountId: string,
  defaultApiVersion: string,
  baseApiVersionValidationParams: Omit<
    Parameters<typeof validateApiVersion>[0],
    'apiVersion'
  >,
) {
  return (apiVersion?: string) => {
    if (apiVersion) {
      validateApiVersion({
        ...baseApiVersionValidationParams,
        apiVersion,
      });
    }

    const urlApiVersion = (apiVersion ?? defaultApiVersion).trim();

    return `${storeUrl}/account/customer/api/${urlApiVersion}/graphql`;
  };
}

function generateGetApiUrl(
  config: CustomerAccountApiClientConfig,
  apiUrlFormatter: (version?: string) => string,
): CustomerAccountApiClient['getApiUrl'] {
  return (propApiVersion?: string) => {
    return propApiVersion ? apiUrlFormatter(propApiVersion) : config.apiUrl;
  };
}