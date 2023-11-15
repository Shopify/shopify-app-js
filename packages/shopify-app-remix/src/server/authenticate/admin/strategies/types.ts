import {SessionContext} from '../types';

export interface AuthorizationStrategy {
  handleRoutes: (request: Request) => void;
  manageAccessToken: ({
    sessionContext,
    shop,
    request,
  }: {
    sessionContext?: SessionContext;
    shop: string;
    request: Request;
  }) => Promise<SessionContext>;
  ensureInstalledOnShop: (request: Request) => void;
}
