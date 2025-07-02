import {ShopifyError} from '@shopify/shopify-api';

import {IdempotentPromiseHandler} from '../idempotent-promise-handler';

const mockFunction = jest.fn();
async function promiseFunction() {
  mockFunction();
}

afterEach(() => {
  mockFunction.mockReset();
});

describe('IdempotentPromiseHandler', () => {
  it('runs the promise function only once for the same identifier', async () => {
    // GIVEN
    const promiseHandler = new IdempotentPromiseHandler();

    // WHEN
    promiseHandler.handlePromise({
      promiseFunction,
      identifier: 'first-promise',
    });

    promiseHandler.handlePromise({
      promiseFunction,
      identifier: 'first-promise',
    });

    // THEN
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it('runs the promise function once for each identifier', async () => {
    // GIVEN
    // const promiseFunction = jest.fn();
    const promiseHandler = new IdempotentPromiseHandler();

    // WHEN
    promiseHandler.handlePromise({
      promiseFunction,
      identifier: 'first-promise',
    });

    promiseHandler.handlePromise({
      promiseFunction,
      identifier: 'second-promise',
    });

    // THEN
    expect(mockFunction).toHaveBeenCalledTimes(2);
  });

  it('clears stale identifier from hash', async () => {
    // GIVEN
    const currentDate = Date.now();
    jest.useFakeTimers().setSystemTime(currentDate);
    const promiseHandler = new IdempotentPromiseHandler() as any;

    // WHEN
    promiseHandler.handlePromise({
      promiseFunction,
      identifier: 'old-promise',
    });

    jest.useFakeTimers().setSystemTime(currentDate + 70000);

    await promiseHandler.handlePromise({
      promiseFunction,
      identifier: 'new-promise',
    });

    expect(promiseHandler.identifiers.size).toBe(1);
  });

  it('clears stale identifier from hash even when promise fails', async () => {
    // GIVEN
    const promiseFunctionErr = () => {
      throw new ShopifyError();
    };
    const currentDate = Date.now();
    jest.useFakeTimers().setSystemTime(currentDate);
    const promiseHandler = new IdempotentPromiseHandler() as any;

    // WHEN
    expect(
      promiseHandler.handlePromise({
        promiseFunction: promiseFunctionErr,
        identifier: 'old-promise',
      }),
    ).rejects.toThrow();

    jest.useFakeTimers().setSystemTime(currentDate + 70000);

    expect(
      promiseHandler.handlePromise({
        promiseFunction: promiseFunctionErr,
        identifier: 'new-promise',
      }),
    ).rejects.toThrow();

    expect(promiseHandler.identifiers.size).toBe(1);
  });
});
