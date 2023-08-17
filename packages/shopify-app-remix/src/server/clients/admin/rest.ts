import {
  DeleteRequestParams,
  GetRequestParams,
  PostRequestParams,
  PutRequestParams,
  RequestParams,
  Session,
  Shopify,
  ShopifyRestResources,
} from '@shopify/shopify-api';

import {AdminClientOptions} from './types';

export type RestClientWithResources<Resources extends ShopifyRestResources> =
  RemixRestClient & {resources: Resources};

export function restClientFactory<
  Resources extends ShopifyRestResources = ShopifyRestResources,
>({
  params,
  handleClientError,
  session,
}: AdminClientOptions): RestClientWithResources<Resources> {
  const {api} = params;
  const client = new RemixRestClient({
    params,
    handleClientError,
    session,
  }) as RestClientWithResources<Resources>;

  if (api.rest) {
    client.resources = {} as Resources;

    const RestResourceClient = restResourceClientFactory({
      params,
      handleClientError,
      session,
    });

    Object.entries(api.rest).forEach(([name, resource]) => {
      class RemixResource extends resource {
        public static Client = RestResourceClient;
      }

      Reflect.defineProperty(RemixResource, 'name', {
        value: name,
      });

      Reflect.set(client.resources, name, RemixResource);
    });
  }

  return client;
}

class RemixRestClient {
  public session: Session;
  private params: AdminClientOptions['params'];
  private handleClientError: AdminClientOptions['handleClientError'];

  constructor({params, session, handleClientError}: AdminClientOptions) {
    this.params = params;
    this.handleClientError = handleClientError;
    this.session = session;
  }

  /**
   * Performs a GET request on the given path.
   */
  public async get(params: GetRequestParams) {
    return this.makeRequest({
      method: 'GET' as RequestParams['method'],
      ...params,
    });
  }

  /**
   * Performs a POST request on the given path.
   */
  public async post(params: PostRequestParams) {
    return this.makeRequest({
      method: 'POST' as RequestParams['method'],
      ...params,
    });
  }

  /**
   * Performs a PUT request on the given path.
   */
  public async put(params: PutRequestParams) {
    return this.makeRequest({
      method: 'PUT' as RequestParams['method'],
      ...params,
    });
  }

  /**
   * Performs a DELETE request on the given path.
   */
  public async delete(params: DeleteRequestParams) {
    return this.makeRequest({
      method: 'DELETE' as RequestParams['method'],
      ...params,
    });
  }

  protected async makeRequest(params: RequestParams): Promise<Response> {
    const originalClient = new this.params.api.clients.Rest({
      session: this.session,
    });
    const originalRequest = Reflect.get(originalClient, 'request');

    try {
      const apiResponse = await originalRequest.call(originalClient, params);

      // We use a separate client for REST requests and REST resources because we want to override the API library
      // client class to return a Response object instead.
      return new Response(JSON.stringify(apiResponse.body), {
        headers: apiResponse.headers,
      });
    } catch (error) {
      if (this.handleClientError) {
        throw await this.handleClientError({
          error,
          session: this.session,
          params: this.params,
        });
      } else throw new Error(error);
    }
  }
}

function restResourceClientFactory({
  params,
  handleClientError,
  session,
}: AdminClientOptions): Shopify['clients']['Rest'] {
  const {api} = params;

  const ApiClient = api.clients.Rest;
  return class RestResourceClient extends ApiClient {
    protected async request(requestParams: RequestParams) {
      const originalClient = new api.clients.Rest({session});
      const originalRequest = Reflect.get(originalClient, 'request');

      try {
        // We just call through to the API library client, and handle the error response here, so that data parsing
        // behaves the same way.
        return await originalRequest.call(originalClient, requestParams);
      } catch (error) {
        if (handleClientError) {
          throw await handleClientError({error, params, session});
        } else throw new Error(error);
      }
    }
  };
}
