interface CustomRequestInit {
  method?: string;
  headers?: HeadersInit;
  body?: string;
  signal?: AbortSignal;
  keepalive?: boolean;
}

export type CustomFetchApi = (
  url: string,
  init?: CustomRequestInit,
) => Promise<Response>;

type OperationVariables = Record<string, any>;

export type DataChunk = Buffer | Uint8Array;

type HeadersObject = Record<string, string | string[]>;

export type {HeadersObject as Headers};

export interface ResponseErrors {
  networkStatusCode?: number;
  message?: string;
  graphQLErrors?: any[];
  response?: Response;
}

export type GQLExtensions = Record<string, any>;

export interface FetchResponseBody<TData = any> {
  data?: TData;
  extensions?: GQLExtensions;
  headers?: Headers;
}

export interface ClientResponse<TData = any> extends FetchResponseBody<TData> {
  errors?: ResponseErrors;
}

export interface ClientStreamResponse<TData = any>
  extends ClientResponse<TData> {
  hasNext: boolean;
}

export interface ClientStreamIterator<TData = any> {
  [Symbol.asyncIterator](): AsyncIterator<ClientStreamResponse<TData>>;
}

export interface LogContent {
  type: string;
  content: any;
}

export interface HTTPResponseLog extends LogContent {
  type: 'HTTP-Response';
  content: {
    requestParams: Parameters<CustomFetchApi>;
    response: Response;
  };
}

export interface HTTPResponseGraphQLDeprecationNotice extends LogContent {
  type: 'HTTP-Response-GraphQL-Deprecation-Notice';
  content: {
    requestParams: Parameters<CustomFetchApi>;
    deprecationNotice: string;
  };
}

export interface HTTPRetryLog extends LogContent {
  type: 'HTTP-Retry';
  content: {
    requestParams: Parameters<CustomFetchApi>;
    lastResponse?: Response;
    retryAttempt: number;
    maxRetries: number;
  };
}

export type LogContentTypes = HTTPResponseLog | HTTPRetryLog | HTTPResponseGraphQLDeprecationNotice;

export type Logger<TLogContentTypes = LogContentTypes> = (
  logContent: TLogContentTypes,
) => void;

export interface ClientOptions {
  headers: HeadersObject;
  url: string;
  customFetchApi?: CustomFetchApi;
  retries?: number;
  logger?: Logger;
}

export interface ClientConfig {
  readonly headers: ClientOptions['headers'];
  readonly url: ClientOptions['url'];
  readonly retries: Required<ClientOptions>['retries'];
}

export interface RequestOptions {
  variables?: OperationVariables;
  url?: string;
  headers?: HeadersObject;
  retries?: number;
  keepalive?: boolean;
  signal?: AbortSignal;
}

export type RequestParams = [operation: string, options?: RequestOptions];

export interface GraphQLClient {
  readonly config: ClientConfig;
  fetch: (...props: RequestParams) => Promise<Response>;
  request: <TData = any>(
    ...props: RequestParams
  ) => Promise<ClientResponse<TData>>;
  requestStream: <TData = any>(
    ...props: RequestParams
  ) => Promise<ClientStreamIterator<TData>>;
}
