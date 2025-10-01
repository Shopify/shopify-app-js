import {Session} from '@shopify/shopify-api';

import {CustomerAccountContext} from '../../clients/customer-account';

export interface CustomerAccountAuthContext extends CustomerAccountContext {
  session: Session;
}

export type AuthenticateCustomerAccount = (
  request: Request,
) => Promise<CustomerAccountAuthContext>;