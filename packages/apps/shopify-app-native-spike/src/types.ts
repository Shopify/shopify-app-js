export interface IdTokenInput {
  clientId: string;
  secretKey: Uint8Array;
  token: string;
  checkAudience?: boolean;
}

export interface TokenExchangeInput extends Omit<
  IdTokenInput,
  'checkAudience'
> {
  clientSecret: string;
  shop: string;
  requestedTokenType: string;
  expiring?: boolean;
}

export type SendRequest = (
  url: string,
  options: RequestInit,
) => Promise<Response>;

export interface TokenExchangeRuntime {
  validateShop: (shop: string) => string;
  fetch: SendRequest;
}

export type TokenExchangeResult<T> = {
  shop: string;
  response: Response;
} & ({ok: true; body: T} | {ok: false; body: unknown});

export interface ClientCredentials {
  clientId: string;
  clientSecret: string;
  oldClientSecret?: string;
}

export interface ResponseDetails {
  status: number;
  body: string;
  headers: Record<string, string>;
}

export interface Log {
  code: string;
  detail: string;
}

export interface HttpLog extends Log {
  req: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
  };
  res: ResponseDetails;
}

export interface TokenExchangeConfig {
  accessMode: 'online' | 'offline';
  idToken: {exchangeable: true; token: string; claims: Record<string, unknown>};
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

export interface NativeTokenExchangeResult {
  ok: boolean;
  shop: string | null;
  accessToken: TokenExchangeAccessToken | null;
  log: Log;
  response: ResponseDetails;
  httpLogs: HttpLog[];
}
