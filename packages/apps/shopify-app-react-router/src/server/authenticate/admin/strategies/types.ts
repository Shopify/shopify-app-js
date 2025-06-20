import {HttpResponseError, Session} from '@shopify/shopify-api';

import {HandleAdminClientError} from '../../../clients';
import {AppConfigArg} from '../../../config-types';
import {BasicParams} from '../../../types';

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
  authenticate: (
    request: Request,
    sessionContext: SessionContext,
  ) => Promise<Session | never>;
  handleClientError: (request: Request) => HandleAdminClientError;
}

export type AuthStrategyFactory<Config extends AppConfigArg> = (
  params: BasicParams<Config['future']>,
) => AuthorizationStrategy;
