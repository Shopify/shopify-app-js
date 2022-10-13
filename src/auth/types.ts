import {Shopify} from '@shopify/shopify-api';

import {AppConfigInterface} from '../types';

export interface CreateAuthAppParams {
  api: Shopify;
  config: AppConfigInterface;
}

export interface CreateAuthBeginParams {
  api: Shopify;
  config: AppConfigInterface;
}

export interface CreateAuthCallbackParams {
  api: Shopify;
  config: AppConfigInterface;
}
