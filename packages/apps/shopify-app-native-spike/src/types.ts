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

export interface TokenExchangeRuntime {
  validateShop: (shop: string) => string;
  fetch: (url: string, options: RequestInit) => Promise<Response>;
}

export type TokenExchangeResult<T> = {
  shop: string;
  response: Response;
} & ({ok: true; body: T} | {ok: false; body: unknown});
