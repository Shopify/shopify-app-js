import {JwtPayload} from '@shopify/shopify-api';

import {SessionContext} from '../types';

export interface SessionTokenContext {
  shop: string;
  sessionId: string;
  payload?: JwtPayload;
}

export interface AuthorizationStrategy {
  respondToOAuthRequests: (request: Request) => Promise<void | never>;
  authenticate: (
    request: Request,
    sessionToken: string,
  ) => Promise<SessionContext | never>;
}
