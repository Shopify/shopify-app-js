import type {AuthenticateCheckout} from './checkout/types';
import type {AuthenticateAppProxy} from './appProxy/types';

export type AuthenticatePublic = AuthenticateCheckout & {
  checkout: AuthenticateCheckout;
  appProxy: AuthenticateAppProxy;
};
