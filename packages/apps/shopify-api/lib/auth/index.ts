import {ConfigInterface} from '../base-types';

import {OAuthBegin, OAuthCallback, begin, callback} from './oauth/oauth';
import {Nonce, nonce} from './oauth/nonce';
import {SafeCompare, safeCompare} from './oauth/safe-compare';
import {
  getEmbeddedAppUrl,
  buildEmbeddedAppUrl,
  GetEmbeddedAppUrl,
  BuildEmbeddedAppUrl,
} from './get-embedded-app-url';
import {TokenExchange, tokenExchange} from './oauth/token-exchange';
import {ClientCredentials, clientCredentials} from './oauth/client-credentials';
import {RefreshToken, refreshToken} from './oauth/refresh-token';
import {
  migrateToExpiringToken,
  MigrateToExpiringToken,
} from './oauth/migrate-to-expiring-token';

export {AuthScopes} from './scopes';

export function shopifyAuth<Config extends ConfigInterface>(
  config: Config,
): ShopifyAuth {
  const shopify = {
    begin: begin(config),
    callback: callback(config),
    nonce,
    safeCompare,
    getEmbeddedAppUrl: getEmbeddedAppUrl(config),
    buildEmbeddedAppUrl: buildEmbeddedAppUrl(config),
    tokenExchange: tokenExchange(config),
    migrateToExpiringToken: migrateToExpiringToken(config),
    refreshToken: refreshToken(config),
    clientCredentials: clientCredentials(config),
  } as ShopifyAuth;

  return shopify;
}

export interface ShopifyAuth {
  begin: OAuthBegin;
  callback: OAuthCallback;
  nonce: Nonce;
  safeCompare: SafeCompare;
  getEmbeddedAppUrl: GetEmbeddedAppUrl;
  buildEmbeddedAppUrl: BuildEmbeddedAppUrl;
  tokenExchange: TokenExchange;
  migrateToExpiringToken: MigrateToExpiringToken;
  refreshToken: RefreshToken;
  clientCredentials: ClientCredentials;
}
