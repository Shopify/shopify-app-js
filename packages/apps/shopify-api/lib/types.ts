export enum LogSeverity {
  Error,
  Warning,
  Info,
  Debug,
}

export enum ApiVersion {
  October22 = '2022-10',
  January23 = '2023-01',
  April23 = '2023-04',
  July23 = '2023-07',
  October23 = '2023-10',
  January24 = '2024-01',
  April24 = '2024-04',
  July24 = '2024-07',
  October24 = '2024-10',
  January25 = '2025-01',
  April25 = '2025-04',
  July25 = '2025-07',
  October25 = '2025-10',
  Unstable = 'unstable',
}

export const LIBRARY_NAME = 'Shopify API Library';

/* eslint-disable @shopify/typescript/prefer-pascal-case-enums */
export enum ShopifyHeader {
  AccessToken = 'X-Shopify-Access-Token',
  ApiVersion = 'X-Shopify-API-Version',
  Domain = 'X-Shopify-Shop-Domain',
  Hmac = 'X-Shopify-Hmac-Sha256',
  Topic = 'X-Shopify-Topic',
  SubTopic = 'X-Shopify-Sub-Topic',
  WebhookId = 'X-Shopify-Webhook-Id',
  StorefrontPrivateToken = 'Shopify-Storefront-Private-Token',
  StorefrontSDKVariant = 'X-SDK-Variant',
  StorefrontSDKVersion = 'X-SDK-Version',
}
/* eslint-enable @shopify/typescript/prefer-pascal-case-enums */

export enum ClientType {
  Rest = 'rest',
  Graphql = 'graphql',
}

export const privacyTopics: string[] = [
  'CUSTOMERS_DATA_REQUEST',
  'CUSTOMERS_REDACT',
  'SHOP_REDACT',
];

export enum BillingInterval {
  OneTime = 'ONE_TIME',
  Every30Days = 'EVERY_30_DAYS',
  Annual = 'ANNUAL',
  Usage = 'USAGE',
}

export type RecurringBillingIntervals = Exclude<
  BillingInterval,
  BillingInterval.OneTime
>;

export enum BillingReplacementBehavior {
  ApplyImmediately = 'APPLY_IMMEDIATELY',
  ApplyOnNextBillingCycle = 'APPLY_ON_NEXT_BILLING_CYCLE',
  Standard = 'STANDARD',
}

export enum StatusCode {
  Continue = 100,
  SwitchingProtocols = 101,
  Ok = 200,
  Created = 201,
  Accepted = 202,
  NonAuthoritativeInformation = 203,
  NoContent = 204,
  ResetContent = 205,
  PartialContent = 206,
  MultipleChoices = 300,
  MovedPermanently = 301,
  Found = 302,
  SeeOther = 303,
  NotModified = 304,
  UseProxy = 305,
  TemporaryRedirect = 307,
  BadRequest = 400,
  Unauthorized = 401,
  PaymentRequired = 402,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  NotAcceptable = 406,
  ProxyAuthenticationRequired = 407,
  RequestTimeout = 408,
  Conflict = 409,
  Gone = 410,
  LengthRequired = 411,
  PreconditionFailed = 412,
  RequestEntityTooLarge = 413,
  RequestUriTooLong = 414,
  UnsupportedMediaType = 415,
  RequestedRangeNotSatisfiable = 416,
  ExpectationFailed = 417,
  ImATeapot = 418,
  UnprocessableEntity = 422,
  TooManyRequests = 429,
  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
  HttpVersionNotSupported = 505,
}

export enum Method {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Patch = 'PATCH',
  Delete = 'DELETE',
  Head = 'HEAD',
  Options = 'OPTIONS',
  Connect = 'CONNECT',
}
