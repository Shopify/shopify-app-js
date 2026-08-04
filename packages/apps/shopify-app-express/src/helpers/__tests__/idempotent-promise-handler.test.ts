import {IdempotentPromiseHandler} from '../idempotent-promise-handler';

describe('IdempotentPromiseHandler', () => {
  it('runs the promise once per identifier, even under concurrent calls', async () => {
    const handler = new IdempotentPromiseHandler();
    const fn = jest.fn().mockResolvedValue(undefined);

    await Promise.all([
      handler.handlePromise({promiseFunction: fn, identifier: 'same'}),
      handler.handlePromise({promiseFunction: fn, identifier: 'same'}),
      handler.handlePromise({promiseFunction: fn, identifier: 'same'}),
    ]);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('runs the promise again for a different identifier', async () => {
    const handler = new IdempotentPromiseHandler();
    const fn = jest.fn().mockResolvedValue(undefined);

    await handler.handlePromise({promiseFunction: fn, identifier: 'a'});
    await handler.handlePromise({promiseFunction: fn, identifier: 'b'});

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
