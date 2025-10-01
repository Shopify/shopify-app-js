import {PKCEParams} from './types';

export async function generatePKCEParams(): Promise<PKCEParams> {
  const randomBytes = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    const nodeCrypto = await import('crypto');
    nodeCrypto.randomFillSync(randomBytes);
  }

  const codeVerifier = base64URLEncode(randomBytes);

  let codeChallenge: string;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    codeChallenge = base64URLEncode(new Uint8Array(digest));
  } else {
    const nodeCrypto = await import('crypto');
    const hash = nodeCrypto.createHash('sha256');
    hash.update(codeVerifier);
    codeChallenge = base64URLEncode(hash.digest());
  }

  return {codeVerifier, codeChallenge};
}

export function generateRandomState(): string {
  const randomBytes = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    const nodeCrypto = require('crypto');
    nodeCrypto.randomFillSync(randomBytes);
  }
  return base64URLEncode(randomBytes);
}

function base64URLEncode(buffer: Uint8Array | Buffer): string {
  const base64 = Buffer.from(buffer).toString('base64');
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}