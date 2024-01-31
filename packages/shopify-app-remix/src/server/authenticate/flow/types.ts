import {Session, ShopifyRestResources} from '@shopify/shopify-api';

import type {AdminApiContext} from '../../clients';

export interface FlowContext<
  Resources extends ShopifyRestResources = ShopifyRestResources,
> {
  session: Session;
  payload: any;
  admin: AdminApiContext<Resources>;
}

export type AuthenticateFlow<
  Resources extends ShopifyRestResources = ShopifyRestResources,
> = (request: Request) => Promise<FlowContext<Resources>>;
