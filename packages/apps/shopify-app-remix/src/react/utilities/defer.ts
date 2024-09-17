export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

export function defer<T>(): Deferred<T> {
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void;
  // eslint-disable-next-line promise/param-names
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {promise, resolve: resolve!, reject: reject!};
}
