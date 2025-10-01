import {AdapterArgs} from '../../../../runtime/http/types';

export interface PKCEParams {
  codeVerifier: string;
  codeChallenge: string;
}

export interface CustomerAccountAuthUrlParams {
  shop: string;
  redirectUri: string;
  clientId: string;
  scopes?: string[];
}

export interface CustomerAccountTokenExchangeParams {
  shop: string;
  authorizationCode: string;
  codeVerifier: string;
  redirectUri: string;
  clientId: string;
}

export interface CustomerAccountTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  id_token: string;
}

export interface DiscoveryEndpoints {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
}

export interface CustomerAccountBeginParams extends AdapterArgs {
  shop: string;
  redirectUri: string;
  clientId: string;
  scopes?: string[];
}

export interface CustomerAccountCallbackParams extends AdapterArgs {
  shop: string;
  authorizationCode: string;
  state: string;
}

