import type {ExchangeRequest} from './transport';

export interface ResponseDetails {
  status: number;
  body: string;
  headers: Record<string, string>;
}

export interface TokenExchangeConfig {
  accessMode: 'online' | 'offline';
  idToken: {
    exchangeable: true;
    token: string;
    claims: Record<string, unknown>;
  };
  invalidTokenResponse?: ResponseDetails | null;
  expiring?: boolean;
}

export interface TokenExchangeAccessToken {
  shop: string;
  token: string;
  scope: string;
  accessMode: 'online' | 'offline';
  expires: string | null;
  refreshToken: string | null;
  refreshTokenExpires: string | null;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    scope: string;
    email: string;
    accountOwner: boolean;
    locale: string;
    collaborator: boolean;
    emailVerified: boolean;
  } | null;
}

export interface Log {
  code: string;
  detail: string;
}

export interface HttpLog extends Log {
  req: ExchangeRequest;
  res: ResponseDetails;
}

export interface TokenExchangeResult {
  ok: boolean;
  shop: string | null;
  accessToken: TokenExchangeAccessToken | null;
  log: Log;
  response: ResponseDetails;
  httpLogs: HttpLog[];
}
