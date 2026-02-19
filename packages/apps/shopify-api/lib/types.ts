export enum LogSeverity {
  Error,
  Warning,
  Info,
  Debug,
}

export enum ApiVersion {
  October24 = '2024-10',
  January25 = '2025-01',
  April25 = '2025-04',
  July25 = '2025-07',
  October25 = '2025-10',
  January26 = '2026-01',
  April26 = '2026-04',
  Unstable = 'unstable',
}

export const LIBRARY_NAME = 'Shopify API Library';

/* eslint-disable @shopify/typescript-prefer-pascal-case-enums */
export enum ShopifyHeader {
  AccessToken = 'X-Shopify-Access-Token',
  ApiVersion = 'X-Shopify-API-Version',
  Domain = 'X-Shopify-Shop-Domain',
  Hmac = 'X-Shopify-Hmac-Sha256',
  Topic = 'X-Shopify-Topic',
  SubTopic = 'X-Shopify-Sub-Topic',
  WebhookId = 'X-Shopify-Webhook-Id',
  Name = 'X-Shopify-Name',
  TriggeredAt = 'X-Shopify-Triggered-At',
  EventId = 'X-Shopify-Event-Id',
  StorefrontPrivateToken = 'Shopify-Storefront-Private-Token',
  StorefrontSDKVariant = 'X-SDK-Variant',
  StorefrontSDKVersion = 'X-SDK-Version',
}
/* eslint-enable @shopify/typescript-prefer-pascal-case-enums */

export const ShopifyEventsHeader = {
  Hmac: 'shopify-hmac-sha256',
  Topic: 'shopify-topic',
  Domain: 'shopify-shop-domain',
  ApiVersion: 'shopify-api-version',
  EventId: 'shopify-event-id',
  Handle: 'shopify-handle',
  Action: 'shopify-action',
  ResourceId: 'shopify-resource-id',
  TriggeredAt: 'shopify-triggered-at',
} as const;

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

/**
 * Configuration for transforming shop domains in split-domain architectures.
 *
 * @example
 * // Template-based transformation
 * {
 *   match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.my\.shop\.dev$/,
 *   transform: '$1.dev-api.shop.dev'
 * }
 *
 * @example
 * // Function-based transformation
 * {
 *   match: /^([^.]+)\.ui\.example\.com$/,
 *   transform: (matches) => `${matches[1]}.api.example.com`
 * }
 */
export interface DomainTransformation {
  /**
   * Pattern to match against shop domains (source domain).
   * Can be a RegExp or string (converted to RegExp internally).
   */
  match: RegExp | string;

  /**
   * Transformation function or template string.
   * - Template string: Uses $1, $2, etc. for capture group substitution
   * - Function: Receives regex match groups and returns transformed domain
   */
  transform: ((matches: RegExpMatchArray) => string | null) | string;

  /**
   * Whether this transformation should also apply to host validation.
   * @default true
   */
  includeHost?: boolean;
}
