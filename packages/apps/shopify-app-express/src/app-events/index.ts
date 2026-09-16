import {
  AppEventInput,
  AppEventLogResult,
  GlobalApiToken,
  HttpResponseError,
} from '@shopify/shopify-api';

import {ApiAndConfigParams} from '../types';

/** Mint a new token when the cached one expires within this window. */
const GLOBAL_API_TOKEN_EXPIRY_SKEW_MS = 60_000;

export interface AppEvents {
  log: (event: AppEventInput) => Promise<AppEventLogResult>;
}

export function appEvents({api}: ApiAndConfigParams): AppEvents {
  let cached: GlobalApiToken | undefined;
  let inFlight: Promise<GlobalApiToken> | undefined;

  function mintToken(): Promise<GlobalApiToken> {
    if (inFlight) {
      return inFlight;
    }
    const request = api.auth.globalApiClientCredentials().then(({token}) => {
      cached = token;
      return token;
    });
    inFlight = request;
    const clear = () => {
      if (inFlight === request) {
        inFlight = undefined;
      }
    };
    request.then(clear, clear);
    return request;
  }

  function getToken(): Promise<GlobalApiToken> {
    if (
      cached &&
      cached.expiresAt.getTime() - Date.now() > GLOBAL_API_TOKEN_EXPIRY_SKEW_MS
    ) {
      return Promise.resolve(cached);
    }
    return mintToken();
  }

  return {
    log: async (event) => {
      const token = await getToken();
      try {
        return await api.appEvents.log({...event, accessToken: token.accessToken});
      } catch (error) {
        if (
          !(error instanceof HttpResponseError && error.response.code === 401)
        ) {
          throw error;
        }
        if (cached?.accessToken === token.accessToken) {
          cached = undefined;
        }
        const freshToken = await getToken();
        return api.appEvents.log({...event, accessToken: freshToken.accessToken});
      }
    },
  };
}
