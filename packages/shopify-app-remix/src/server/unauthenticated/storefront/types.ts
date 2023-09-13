import {Session} from '@shopify/shopify-api';

import type {StorefrontContext} from '../../clients';

export interface UnauthenticatedStorefrontContext {
  /**
   * TODO: Add TSDoc
   */
  session: Session;

  /**
   * TODO: Add TSDoc
   */
  storefront: StorefrontContext;
}

export type GetUnauthenticatedStorefrontContext = (
  shop: string,
) => Promise<UnauthenticatedStorefrontContext>;
