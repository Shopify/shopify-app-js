import {Session} from '@shopify/shopify-api';

import {sessionArraysEqual} from '../session-test-utils';
import {waitForContainerLog} from '../utils';

describe('waitForContainerLog', () => {
  it('waits until the expected log appears', async () => {
    const getLogs = jest
      .fn()
      .mockResolvedValueOnce('starting')
      .mockResolvedValueOnce('Ready to accept connections');

    await waitForContainerLog(getLogs, 'Ready to accept connections', {
      interval: 1,
      timeout: 100,
    });

    expect(getLogs).toHaveBeenCalledTimes(2);
  });
  it('retries when reading logs fails', async () => {
    const getLogs = jest
      .fn()
      .mockRejectedValueOnce(new Error('container is starting'))
      .mockResolvedValueOnce('Ready to accept connections');

    await waitForContainerLog(getLogs, 'Ready to accept connections', {
      interval: 1,
      timeout: 100,
    });

    expect(getLogs).toHaveBeenCalledTimes(2);
  });
  it('includes the last logs when readiness times out', async () => {
    const getLogs = jest.fn().mockResolvedValue('starting\nstill starting');

    await expect(
      waitForContainerLog(getLogs, 'Ready to accept connections', {
        interval: 1,
        timeout: 20,
      }),
    ).rejects.toThrow('Last container logs:\nstarting\nstill starting');
  });
});

describe('test sessionArraysEqual', () => {
  it('returns true for two identically ordered arrays', () => {
    const sessionsExpected = [
      new Session({
        id: 'test_sessions_1',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_2',
        shop: 'shop2-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_3',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_4',
        shop: 'shop3-sessions',
        state: 'state',
        isOnline: true,
      }),
    ];
    const sessionsToCompare = [
      new Session({
        id: 'test_sessions_1',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_2',
        shop: 'shop2-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_3',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_4',
        shop: 'shop3-sessions',
        state: 'state',
        isOnline: true,
      }),
    ];

    expect(sessionArraysEqual(sessionsToCompare, sessionsExpected)).toBe(true);
  });

  it('returns true for two arrays with same content but out of order', () => {
    const sessionsExpected = [
      new Session({
        id: 'test_sessions_1',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_2',
        shop: 'shop2-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_3',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_4',
        shop: 'shop3-sessions',
        state: 'state',
        isOnline: true,
      }),
    ];
    const sessionsToCompare = [
      new Session({
        id: 'test_sessions_1',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_3',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_2',
        shop: 'shop2-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_4',
        shop: 'shop3-sessions',
        state: 'state',
        isOnline: true,
      }),
    ];

    expect(sessionArraysEqual(sessionsToCompare, sessionsExpected)).toBe(true);
  });

  it('returns false for two arrays not the same size', () => {
    const sessionsExpected = [
      new Session({
        id: 'test_sessions_1',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
    ];
    const sessionsToCompare = [
      new Session({
        id: 'test_sessions_1',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_3',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_2',
        shop: 'shop2-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_4',
        shop: 'shop3-sessions',
        state: 'state',
        isOnline: true,
      }),
    ];

    expect(sessionArraysEqual(sessionsToCompare, sessionsExpected)).toBe(false);
  });

  it('returns false for two arrays of the same size but different content', () => {
    const sessionsExpected = [
      new Session({
        id: 'test_sessions_1',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_3',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_2',
        shop: 'shop2-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_4',
        shop: 'shop3-sessions',
        state: 'state',
        isOnline: true,
      }),
    ];
    let sessionsToCompare = [
      new Session({
        id: 'test_sessions_1',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_3',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_2',
        shop: 'shop2-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_5',
        shop: 'shop3-sessions',
        state: 'state',
        isOnline: true,
      }),
    ];

    expect(sessionArraysEqual(sessionsToCompare, sessionsExpected)).toBe(false);

    sessionsToCompare = [
      new Session({
        id: 'test_sessions_1',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_3',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_2',
        shop: 'shop2-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_4',
        shop: 'shop4-sessions',
        state: 'state',
        isOnline: true,
      }),
    ];

    expect(sessionArraysEqual(sessionsToCompare, sessionsExpected)).toBe(false);

    sessionsToCompare = [
      new Session({
        id: 'test_sessions_1',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_3',
        shop: 'shop1-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_2',
        shop: 'shop2-sessions',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: 'test_sessions_4',
        shop: 'shop3-sessions',
        state: 'state',
        isOnline: false,
      }),
    ];

    expect(sessionArraysEqual(sessionsToCompare, sessionsExpected)).toBe(false);
  });
});
