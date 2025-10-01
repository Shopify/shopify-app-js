import {ConfigInterface} from '../../../base-types';

import {
  begin,
  generateAuthorizationUrl,
  CustomerAccountOAuthBegin,
} from './begin-oauth';
import {
  callback,
  exchangeCodeForToken,
  CustomerAccountOAuthCallback,
} from './callback';
import {discoverAuthEndpoints} from './discovery';
import {generatePKCEParams, generateRandomState} from './pkce-utils';
import {createCustomerAccountSession} from './create-session';

// Re-export types
export type {
  PKCEParams,
  CustomerAccountAuthUrlParams,
  CustomerAccountTokenExchangeParams,
  CustomerAccountTokenResponse,
  DiscoveryEndpoints,
  CustomerAccountBeginParams,
  CustomerAccountCallbackParams,
} from './types';

export type {
  CustomerAccountOAuthBegin,
  CustomerAccountOAuthCallback,
};

// Export individual functions for direct use
export {
  begin,
  callback,
  generateAuthorizationUrl,
  exchangeCodeForToken,
  discoverAuthEndpoints,
  generatePKCEParams,
  generateRandomState,
  createCustomerAccountSession,
};

// Convenience function aliases for better developer experience
export function beginCustomerAccountOAuth(config: ConfigInterface): CustomerAccountOAuthBegin {
  return begin(config);
}

export function handleCustomerAccountCallback(config: ConfigInterface): CustomerAccountOAuthCallback {
  return callback(config);
}