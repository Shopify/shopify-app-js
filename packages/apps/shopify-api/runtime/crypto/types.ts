export enum HashFormat {
  Base64 = 'base64',
  Hex = 'hex',
}

export interface EncryptionOptions {
  key: CryptoKey;
  iv: Uint8Array;
}
