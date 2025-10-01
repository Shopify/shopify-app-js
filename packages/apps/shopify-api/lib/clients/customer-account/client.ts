import {
  CustomerAccountApiClient,
  CustomerAccountOperations,
  createCustomerAccountApiClient,
  ClientResponse,
  ReturnData,
  ApiClientRequestOptions,
} from '@shopify/customer-account-api-client';

import {ApiVersion} from '../../types';
import {logger} from '../../logger';
import * as ShopifyErrors from '../../error';
import {MissingRequiredArgument} from '../../error';
import type {
  GraphqlClientParams,
  GraphqlParams,
  GraphqlQueryOptions,
  RequestReturn,
} from '../types';
import {ConfigInterface} from '../../base-types';
import {Session} from '../../session/session';
import {abstractFetch} from '../../../runtime';
import {clientLoggerFactory, getUserAgent, throwFailedRequest} from '../common';

interface GraphqlClientClassParams {
  config: ConfigInterface;
}

export class CustomerAccountClient {
  public static config: ConfigInterface;

  readonly session: Session;
  readonly client: CustomerAccountApiClient;
  readonly apiVersion?: ApiVersion;

  constructor(params: GraphqlClientParams) {
    const config = this.customerAccountClass().config;

    if (!params.session.accessToken) {
      throw new ShopifyErrors.MissingRequiredArgument(
        'Missing access token when creating Customer Account client',
      );
    }

    if (params.apiVersion) {
      const message =
        params.apiVersion === config.apiVersion
          ? `Customer Account client has a redundant API version override to the default ${params.apiVersion}`
          : `Customer Account client overriding default API version ${config.apiVersion} with ${params.apiVersion}`;

      logger(config).debug(message);
    }

    const accessToken = params.session.accessToken;

    if (!accessToken) {
      throw new MissingRequiredArgument('Session missing access token.');
    }

    this.session = params.session;
    this.apiVersion = params.apiVersion;
    this.client = createCustomerAccountApiClient({
      accessToken,
      apiVersion: this.apiVersion ?? config.apiVersion,
      storeDomain: this.session.shop,
      customerAccountId: this.session.shop,
      customFetchApi: abstractFetch,
      logger: clientLoggerFactory(config),
    });
  }

  public async query<T = undefined>(
    params: GraphqlParams,
  ): Promise<RequestReturn<T>> {
    logger(this.customerAccountClass().config).deprecated(
      '12.0.0',
      'The query method is deprecated, and was replaced with the request method.\n' +
        'See the migration guide: https://github.com/Shopify/shopify-app-js/blob/main/packages/apps/shopify-api/docs/migrating-to-v9.md#using-the-new-clients.',
    );

    if (
      (typeof params.data === 'string' && params.data.length === 0) ||
      Object.entries(params.data).length === 0
    ) {
      throw new ShopifyErrors.MissingRequiredArgument('Query missing.');
    }

    let operation: string;
    let variables: Record<string, any> | undefined;
    if (typeof params.data === 'string') {
      operation = params.data;
    } else {
      operation = params.data.query;
      variables = params.data.variables;
    }

    const headers = Object.fromEntries(
      Object.entries(params?.extraHeaders ?? {}).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(', ') : value.toString(),
      ]),
    );

    const response = await this.request<T>(operation, {
      headers,
      retries: params.tries ? params.tries - 1 : undefined,
      variables,
    });

    return {body: response as T, headers: {}};
  }

  public async request<
    T = undefined,
    Operation extends keyof Operations = string,
    Operations extends CustomerAccountOperations = CustomerAccountOperations,
  >(
    operation: Operation,
    options?: GraphqlQueryOptions<Operation, Operations>,
  ): Promise<
    ClientResponse<T extends undefined ? ReturnData<Operation, Operations> : T>
  > {
    const response = await this.client.request<T, Operation>(operation, {
      apiVersion: this.apiVersion || this.customerAccountClass().config.apiVersion,
      ...(options as ApiClientRequestOptions<Operation, CustomerAccountOperations>),
    });

    if (response.errors) {
      const fetchResponse = response.errors.response;

      throwFailedRequest(response, (options?.retries ?? 0) > 0, fetchResponse);
    }

    return response;
  }

  private customerAccountClass() {
    return this.constructor as typeof CustomerAccountClient;
  }
}

export function customerAccountClientClass(params: GraphqlClientClassParams) {
  const {config} = params;
  class NewCustomerAccountClient extends CustomerAccountClient {
    public static config = config;
  }

  Reflect.defineProperty(NewCustomerAccountClient, 'name', {
    value: 'CustomerAccountClient',
  });

  return NewCustomerAccountClient as typeof CustomerAccountClient;
}