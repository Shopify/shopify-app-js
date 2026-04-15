import '@shopify/shopify-api/adapters/cf-worker';
import {setAbstractRuntimeString} from '@shopify/shopify-api/runtime';

import {setAppBridgeUrlOverride} from '../../authenticate/helpers';

setAbstractRuntimeString(() => {
  return `React Router (Cloudflare Worker)`;
});

// `process.env` is available on Cloudflare Workers when the `nodejs_compat`
// compatibility flag is enabled. Without it, accessing `process` throws a
// `ReferenceError`, which we catch so the adapter still loads. Users who need
// to override App Bridge in that environment can call `setAppBridgeUrlOverride`
// from `@shopify/shopify-app-react-router/server` directly.
try {
  /* eslint-disable no-process-env */
  if (process.env.APP_BRIDGE_URL) {
    setAppBridgeUrlOverride(process.env.APP_BRIDGE_URL);
  }
  /* eslint-enable no-process-env */
} catch {
  // `process` is not defined on Workers without `nodejs_compat` — silently
  // skip the env-driven override.
}
