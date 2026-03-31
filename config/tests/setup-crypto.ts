// jose v6 is webapi-only and expects `crypto` to be a global (Web Crypto API).
// Jest's VM context does not always expose `crypto`, so we polyfill it here.
import {webcrypto} from 'crypto';

if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = webcrypto;
}
