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
});
