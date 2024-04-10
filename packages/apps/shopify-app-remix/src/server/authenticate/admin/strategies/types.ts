import {HttpResponseError, Session} from '@shopify/shopify-api';

import {HandleAdminClientError} from '../../../clients';

export interface SessionContext {
  shop: string;
  session?: Session;
  sessionToken?: string;
}

export interface OnErrorOptions {
  request: Request;
  session: Session;
  error: HttpResponseError;
}

export interface HandleClientErrorOptions {
  request: Request;
  onError?: ({session, error}: OnErrorOptions) => Promise<void | never>;
}

export interface AuthorizationStrategy {
  respondToOAuthRequests: (request: Request) => Promise<void | never>;
  authenticate: (
    request: Request,
    sessionContext: SessionContext,
  ) => Promise<Session | never>;
  handleClientError: (request: Request) => HandleAdminClientError;
}
