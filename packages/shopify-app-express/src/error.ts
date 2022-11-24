export class ShopifyAppError extends Error {
  constructor(...args: any) {
    super(...args);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SessionStorageError extends ShopifyAppError {}
