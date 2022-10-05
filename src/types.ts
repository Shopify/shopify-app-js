import {ConfigParams as ApiConfigParams, Shopify} from '@shopify/shopify-api';

export interface ShopifyApp {
  api: Shopify;
}

export type ApiConfigParamsWithoutDefaults = Omit<
  ApiConfigParams,
  'isEmbeddedApp'
> & {
  isEmbeddedApp?: boolean;
};

export interface AppConfigParams {
  api: ApiConfigParamsWithoutDefaults;
}
