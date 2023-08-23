import {ShopifyRestResources} from '@shopify/shopify-api';

import type {AuthenticateCheckout} from './checkout/types';
import type {AuthenticateStorefrontAppProxy} from './storefontAppProxy/types';

export type AuthenticatePublic<Resources extends ShopifyRestResources> =
  AuthenticateCheckout & {
    checkout: AuthenticateCheckout;
    storefrontAppProxy: AuthenticateStorefrontAppProxy<Resources>;
  };
