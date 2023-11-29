import {JwtPayload, Session} from '@shopify/shopify-api';

export interface SessionTokenContext {
  shop: string;
  sessionId?: string;
  sessionToken?: string;
  payload?: JwtPayload;
}

export interface SessionContext {
  shop: string;
  session?: Session;
  sessionToken?: string;
}

export interface AuthorizationStrategy {
  respondToOAuthRequests: (request: Request) => Promise<void | never>;
  authenticate: (
    request: Request,
    sessionContext: SessionContext,
  ) => Promise<Session | never>;
}
