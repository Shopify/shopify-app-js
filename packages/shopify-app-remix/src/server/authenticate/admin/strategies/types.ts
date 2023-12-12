import {Session} from '@shopify/shopify-api';

export interface SessionContext {
  shop: string;
  session?: Session;
  sessionToken?: string;
}

export interface HandleClientErrorOptions {
  request: Request;
  authStrategy?: AuthorizationStrategy;
}

export interface HandleInvalidAccessTokenOptions {
  request: Request;
  session: Session;
  error: any;
}
export interface AuthorizationStrategy {
  respondToOAuthRequests: (request: Request) => Promise<void | never>;
  authenticate: (
    request: Request,
    sessionContext: SessionContext,
  ) => Promise<Session | never>;
  handleInvalidAccessTokenError: ({
    request,
    session,
  }: HandleInvalidAccessTokenOptions) => Promise<void | never>;
}
