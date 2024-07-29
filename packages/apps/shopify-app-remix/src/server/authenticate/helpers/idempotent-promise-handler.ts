export interface IdempotentHandlePromiseParams {
  promiseFunction: () => Promise<any>;
  identifier: string;
}

const IDENTIFIER_TTL_MS = 60000;

export class IdempotentPromiseHandler {
  protected identifiers: Map<string, number>;

  constructor() {
    this.identifiers = new Map<string, number>();
  }

  async handlePromise({
    promiseFunction,
    identifier,
  }: IdempotentHandlePromiseParams): Promise<any> {
    try {
      if (this.isPromiseRunnable(identifier)) {
        await promiseFunction();
      }
    } finally {
      this.clearStaleIdentifiers();
    }

    return Promise.resolve();
  }

  private isPromiseRunnable(identifier: string) {
    if (!this.identifiers.has(identifier)) {
      this.identifiers.set(identifier, Date.now());
      return true;
    }
    return false;
  }

  private async clearStaleIdentifiers() {
    this.identifiers.forEach((date, identifier, map) => {
      if (Date.now() - date > IDENTIFIER_TTL_MS) {
        map.delete(identifier);
      }
    });
  }
}
