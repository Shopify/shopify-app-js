import {SessionContext} from '../types';

export interface AuthorizationStrategy {
  handleRoutes: (request: Request) => void;
  manageAccessToken: (
    sessionContext: SessionContext | undefined,
    shop: string,
    request: Request,
  ) => Promise<SessionContext>;
  ensureInstalledOnShop: (request: Request) => void;
}
