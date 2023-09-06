import {Session, ShopifyRestResources} from '@shopify/shopify-api';
import {AdminApiContext} from '../../../config-types';

export type AuthenticateAppProxy = (
  request: Request,
) => Promise<AppProxyContext | AppProxyContextWithSession>;

export interface AppProxyContext {
  session: undefined;
  admin: undefined;
}

export interface AppProxyContextWithSession<
  Resources extends ShopifyRestResources = ShopifyRestResources,
> {
  session: Session;
  admin: AdminApiContext<Resources>;
}
