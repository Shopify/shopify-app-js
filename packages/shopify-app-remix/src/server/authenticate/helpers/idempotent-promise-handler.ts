export interface IdempotentHandlePromiseParams {
  promiseFunction: () => Promise<any>;
  identifier: string;
}

export class IdempotentPromiseHandler {
  protected identifiers: Set<string>;

  constructor() {
    this.identifiers = new Set<string>();
  }

  async handlePromise({
    promiseFunction,
    identifier,
  }: IdempotentHandlePromiseParams): Promise<any> {
    if (this.isPromiseRunnable(identifier)) {
      await promiseFunction();
    }

    return Promise.resolve();
  }

  private isPromiseRunnable(identifier?: string) {
    if (!identifier) return true;

    if (!this.identifiers.has(identifier)) {
      this.identifiers.add(identifier);
      return true;
    }
    return false;
  }
}
