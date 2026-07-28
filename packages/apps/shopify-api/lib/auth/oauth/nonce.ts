import {asHex} from '../../../runtime/crypto';

export type Nonce = () => string;

export function nonce(): string {
  return asHex(crypto.getRandomValues(new Uint8Array(32)));
}
