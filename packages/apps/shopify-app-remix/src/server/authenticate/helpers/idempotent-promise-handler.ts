export interface IdempotentHandlePromiseParams {
  promiseFunction: () => Promise<any>;
  identifier: string;
}

interface PromiseCacheEntry {
  promise: Promise<any>;
  startTime: number;
}

const IDENTIFIER_TTL_MS = 60000;

export class IdempotentPromiseHandler {
  protected identifiers: Map<string, PromiseCacheEntry>;

  constructor() {
    this.identifiers = new Map<string, PromiseCacheEntry>();
  }

  async handlePromise({
    promiseFunction,
    identifier,
  }: IdempotentHandlePromiseParams): Promise<any> {
    try {
      const entry = this.identifiers.get(identifier);

      if (entry) return entry.promise;

      const promise = promiseFunction();

      this.identifiers.set(identifier, {
        promise,
        startTime: Date.now(),
      });

      return promise;
    } finally {
      this.clearStaleIdentifiers();
    }
  }

  private clearStaleIdentifiers() {
    const now = Date.now();
    this.identifiers.forEach((entry, identifier, map) => {
      if (now - entry.startTime > IDENTIFIER_TTL_MS) {
        map.delete(identifier);
      }
    });
  }
}
