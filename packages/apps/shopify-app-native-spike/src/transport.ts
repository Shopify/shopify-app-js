export interface ExchangeRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}

export type SendRequest = (
  url: string,
  options: RequestInit,
) => Promise<Response>;

export interface ExchangeInput {
  clientId: string;
  clientSecret: string;
  shopDomain: string;
  idToken: string;
  requestedTokenType: string;
  expiring: 0 | 1 | '0' | '1';
  headers?: Record<string, string>;
  redirect?: RequestRedirect;
}

export type ExchangeAttempt = {request: ExchangeRequest} & (
  {ok: true; response: Response} | {ok: false; error: unknown}
);

// Callers must validate the destination and ID token before sending credentials.
export async function executeTokenExchange(
  input: ExchangeInput,
  send: SendRequest,
): Promise<ExchangeAttempt> {
  const request: ExchangeRequest = {
    url: `https://${input.shopDomain}/admin/oauth/access_token`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...input.headers,
    },
    body: JSON.stringify({
      client_id: input.clientId,
      client_secret: input.clientSecret,
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      subject_token: input.idToken,
      subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
      requested_token_type: input.requestedTokenType,
      expiring: input.expiring,
    }),
  };

  try {
    const response = await send(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      ...(input.redirect && {redirect: input.redirect}),
    });
    return {ok: true, request, response};
  } catch (error) {
    return {ok: false, request, error};
  }
}
