import crypto from 'crypto';

import {
  setAbstractRuntimeString,
  setCrypto,
} from '@shopify/shopify-api/runtime';

setCrypto(crypto as any);

setAbstractRuntimeString(() => {
  return `Remix (Node)`;
});
