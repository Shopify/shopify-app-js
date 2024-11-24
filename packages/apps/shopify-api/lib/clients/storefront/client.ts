import {
  StorefrontApiClient,
  StorefrontOperations,
  ClientResponse,
  createStorefrontApiClient,
  ReturnData,
  ApiClientRequestOptions,
} from '@shopify/storefront-api-client';

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

export class StorefrontClient {
  public static config: ConfigInterface;
  private _client?: StorefrontApiClient;

  readonly session: Session;
  readonly apiVersion?: ApiVersion;

  private static readonly QUERY_DEPRECATION_WARNING =
    'The query method is deprecated, and was replaced with the request method.\n' +
    'See the migration guide: https://github.com/Shopify/shopify-app-js/blob/main/packages/apps/shopify-api/docs/migrating-to-v9.md#using-the-new-clients.';

  constructor(params: GraphqlClientParams) {
    const config = this.storefrontClass().config;

    if (!config.isCustomStoreApp && !params.session.accessToken) {
      throw new ShopifyErrors.MissingRequiredArgument(
        'Missing access token when creating GraphQL client',
      );
    }

    if (params.apiVersion && params.apiVersion !== config.apiVersion) {
      logger(config).debug(
        `Storefront client overriding default API version ${config.apiVersion} with ${params.apiVersion}`,
      );
    }

    this.session = params.session;
    this.apiVersion = params.apiVersion;
  }

  private get client(): StorefrontApiClient {
    if (!this._client) {
      const config = this.storefrontClass().config;
      this._client = createStorefrontApiClient({
        privateAccessToken: this.resolveAccessToken(config, this.session),
        apiVersion: this.apiVersion ?? config.apiVersion,
        storeDomain: this.session.shop,
        customFetchApi: abstractFetch,
        logger: clientLoggerFactory(config),
        clientName: getUserAgent(config),
      });
    }
    return this._client;
  }

  public async query<T = undefined>(
    params: GraphqlParams,
  ): Promise<RequestReturn<T>> {
    logger(this.storefrontClass().config).deprecated(
      '12.0.0',
      StorefrontClient.QUERY_DEPRECATION_WARNING,
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

    const headers = Object.entries(params?.extraHeaders ?? {}).reduce(
      (acc, [key, value]) => {
        acc[key] = Array.isArray(value) ? value.join(', ') : value.toString();
        return acc;
      },
      {} as Record<string, string>,
    );

    const response = await this.request<T>(operation, {
      headers,
      retries: params?.tries ? params.tries - 1 : undefined,
      variables,
    });

    return {body: response as T, headers: {}};
  }

  public async request<
    T = undefined,
    Operation extends keyof Operations = string,
    Operations extends StorefrontOperations = StorefrontOperations,
  >(
    operation: Operation,
    options?: GraphqlQueryOptions<Operation, Operations>,
  ): Promise<
    ClientResponse<T extends undefined ? ReturnData<Operation, Operations> : T>
  > {
    const response = await this.client.request<T, Operation>(operation, {
      apiVersion: this.apiVersion || this.storefrontClass().config.apiVersion,
      ...(options as ApiClientRequestOptions<Operation, StorefrontOperations>),
    });

    if (response.errors) {
      throwFailedRequest(
        response,
        Boolean(options?.retries && options.retries > 0),
        response.errors.response,
      );
    }

    return response;
  }

  private resolveAccessToken(
    config: ConfigInterface,
    session: Session,
  ): string {
    if (config.isCustomStoreApp) {
      if (!config.privateAppStorefrontAccessToken) {
        throw new MissingRequiredArgument(
          'Custom store apps must set the privateAppStorefrontAccessToken property to call the Storefront API.',
        );
      }
      return config.privateAppStorefrontAccessToken;
    }

    if (!session.accessToken) {
      throw new MissingRequiredArgument('Session missing access token.');
    }

    return session.accessToken;
  }

  private storefrontClass() {
    return this.constructor as typeof StorefrontClient;
  }
}

export function storefrontClientClass(params: GraphqlClientClassParams) {
  const {config} = params;
  class NewStorefrontClient extends StorefrontClient {
    public static config = config;
  }

  Reflect.defineProperty(NewStorefrontClient, 'name', {
    value: 'StorefrontClient',
  });

  return NewStorefrontClient as typeof StorefrontClient;
}
