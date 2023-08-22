import crypto from 'crypto';

import {
  setAbstractRuntimeString,
  setCrypto,
} from '@shopify/shopify-api/runtime';

import {setAppBridgeUrlOverride} from '../../authenticate/helpers';

setCrypto(crypto as any);

setAbstractRuntimeString(() => {
  return `Remix (Node)`;
});

/* eslint-disable no-process-env */
if (process.env.APP_BRIDGE_URL) {
  setAppBridgeUrlOverride(process.env.APP_BRIDGE_URL);
}
/* eslint-enable no-process-env */
