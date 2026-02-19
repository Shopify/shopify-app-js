import {FutureFlagOptions} from '../future/flags';
import {ShopifyRestResources} from '../rest/types';

import {AuthScopes} from './auth/scopes';
import {BillingConfig} from './billing/types';
import {ApiVersion, DomainTransformation, LogSeverity} from './types';

/**
 * A function used by the library to log events related to Shopify.
 */
export type LogFunction = (severity: LogSeverity, msg: string) => void;

export interface ConfigParams<
  Resources extends ShopifyRestResources = ShopifyRestResources,
  Future extends FutureFlagOptions = FutureFlagOptions,
> {
  /**
   * The API key for your app.
   *
   * Also known as Client ID in your Partner Dashboard.
   */
  apiKey?: string;
  /**
   * The API secret key for your app.
   *
   * Also known as Client Secret in your Partner Dashboard.
   */
  apiSecretKey: string;
  /**
   * The scopes your app needs to access the API. Not required if using Shopify managed installation.
   */
  scopes?: string[] | AuthScopes;
  /**
   * The host name of your app.
   */
  hostName: string;
  /**
   * The scheme to use for the app host.
   */
  hostScheme?: 'http' | 'https';
  /**
   * The API version to use.
   */
  apiVersion: ApiVersion;
  /**
   * Whether the app is embedded in the Shopify admin.
   */
  isEmbeddedApp: boolean;
  /**
   * Whether the app is a Shopify admin custom store app.
   *
   * @link https://shopify.dev/docs/apps/distribution
   */
  isCustomStoreApp?: boolean;
  /**
   * An app-wide API access token.
   *
   * Only applies to custom apps.
   */
  adminApiAccessToken?: string;
  /**
   * The user agent prefix to use for API requests.
   */
  userAgentPrefix?: string;
  /**
   * An app-wide API access token for the storefront API.
   *
   * Only applies to custom apps.
   */
  privateAppStorefrontAccessToken?: string;
  /**
   * Custom domain transformations for split-domain architectures.
   *
   * Transformations are applied in order. The first matching transformation is used.
   * If no transformation matches, the domain is validated as-is.
   *
   * @example
   * // Simple template-based transformation
   * domainTransformations: [{
   *   match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.my\.shop\.dev$/,
   *   transform: '$1.dev-api.shop.dev'
   * }]
   *
   * @example
   * // Function-based transformation with custom logic
   * domainTransformations: [{
   *   match: /^([^.]+)\.ui\.example\.com$/,
   *   transform: (matches) => {
   *     const shopName = matches[1];
   *     return shopName.startsWith('test-')
   *       ? `${shopName}.api-staging.example.com`
   *       : `${shopName}.api.example.com`;
   *   }
   * }]
   */
  domainTransformations?: DomainTransformation[];
  /**
   * Billing configurations for the app.
   */
  billing?: BillingConfig;
  /**
   * REST resources to access the Admin API.
   *
   * You can import these from `@shopify/shopify-api/rest/admin/*`.
   */
  restResources?: Resources;
  /**
   * Customization options for Shopify logs.
   */
  logger?: {
    /**
     * A custom log function.
     */
    log?: LogFunction;
    /**
     * The minimum severity level to log.
     */
    level?: LogSeverity;
    /**
     * Whether to log HTTP requests.
     */
    httpRequests?: boolean;
    /**
     * Whether to log timestamps.
     */
    timestamps?: boolean;
  };
  /**
   * Future flags to include for this app.
   */
  future?: Future;
  /**
   * Whether to log disabled future flags at startup.
   *
   * @private
   */
  _logDisabledFutureFlags?: boolean;
  /**
   * Whether the app is initialised for local testing.
   */
  isTesting?: boolean;
}

export type ConfigInterface<Params extends ConfigParams = ConfigParams> = Omit<
  Params,
  'restResources' | 'scopes'
> & {
  apiKey: string;
  hostScheme: 'http' | 'https';
  scopes?: AuthScopes;
  isCustomStoreApp: boolean;
  billing?: BillingConfig;
  logger: {
    log: LogFunction;
    level: LogSeverity;
    httpRequests: boolean;
    timestamps: boolean;
  };
  future: FutureFlagOptions;
  isTesting?: boolean;
};
