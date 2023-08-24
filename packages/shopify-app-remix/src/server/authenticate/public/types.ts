import {ShopifyRestResources} from '@shopify/shopify-api';

import type {AuthenticateCheckout} from './checkout/types';
import type {AuthenticateAppProxy} from './appProxy/types';

export type AuthenticatePublic<Resources extends ShopifyRestResources> =
  AuthenticateCheckout & {
    checkout: AuthenticateCheckout;
    appProxy: AuthenticateAppProxy<Resources>;
  };
