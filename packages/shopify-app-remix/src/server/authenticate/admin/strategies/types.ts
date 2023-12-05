import {JwtPayload, Session} from '@shopify/shopify-api';

export interface SessionTokenContext {
  shop: string;
  sessionId?: string;
  payload?: JwtPayload;
}

export interface AuthorizationStrategy {
  respondToOAuthRequests: (request: Request) => Promise<void | never>;
  authenticate: (
    request: Request,
    session: Session | undefined,
    shop: string,
  ) => Promise<Session | never>;
}
