import {SessionContext} from '../types';

export interface AuthorizationStrategy {
  // authenticate: (request: Request) => Promise<SessionContext>;
  respondToOAuthRequests: (request: Request) => Promise<void>;
  acquireAccessToken: ({
    sessionContext,
    shop,
    request,
  }: {
    sessionContext?: SessionContext;
    shop: string;
    request: Request;
  }) => Promise<SessionContext>;
  ensureInstalledOnShop: (request: Request) => Promise<void>;
}
