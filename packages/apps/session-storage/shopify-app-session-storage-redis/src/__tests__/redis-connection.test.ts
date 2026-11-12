import {createClient} from 'redis';

import type {RedisSessionStorage, RedisSessionStorageOptions} from '../redis';
import {RedisClient, RedisConnection} from '../redis-connection';

jest.mock('redis', () => ({
  createClient: jest.fn(() => mockClient),
}));

// A supplied client does not need event registration or client configuration APIs.
const mockClient = {
  isReady: false,
  connect: jest.fn(async () => undefined),
  quit: jest.fn(async () => 'OK'),
  keys: jest.fn(async (_pattern: string) => ['sessions_key']),
  get: jest.fn(async (_key: string) => 'value'),
  set: jest.fn(async (_key: string, _value: string) => 'OK'),
  del: jest.fn(async (_key: string) => 1),
  on: jest.fn(),
};

const suppliedClient: RedisClient = {
  get isReady() {
    return mockClient.isReady;
  },
  connect: mockClient.connect,
  quit: mockClient.quit,
  keys: mockClient.keys,
  get: mockClient.get,
  set: mockClient.set,
  del: mockClient.del,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockClient.isReady = false;
});

describe('RedisConnection client policy', () => {
  it('accepts the default client type through both constructor contracts', () => {
    // These assignments can also be checked by tsc against the public contract.
    // They compare only the bounded contract, avoiding recursive client types.
    const client: RedisClient = createClient();
    const storageInput: ConstructorParameters<typeof RedisSessionStorage>[0] =
      client;
    const connectionInput: ConstructorParameters<typeof RedisConnection>[0] =
      client;

    expect(storageInput).toBe(connectionInput);
  });

  it.each(['redis://localhost/1', new URL('redis://localhost/1')])(
    'preserves RESP2 and unbounded queue wait for %s',
    (url) => {
      new RedisConnection(url, {}, 'sessions');

      expect(jest.mocked(createClient).mock.calls[0][0]).toStrictEqual({
        url: 'redis://localhost/1',
        RESP: 2,
        commandOptions: {timeout: undefined},
      });
      expect(mockClient.on).toHaveBeenCalledTimes(4);
    },
  );

  it('preserves RESP2 when the caller leaves RESP explicitly undefined', () => {
    new RedisConnection('redis://localhost/1', {RESP: undefined}, 'sessions');

    expect(jest.mocked(createClient).mock.calls[0][0]).toStrictEqual({
      url: 'redis://localhost/1',
      RESP: 2,
      commandOptions: {timeout: undefined},
    });
  });

  const callerOptions: Partial<RedisSessionStorageOptions>[] = [
    {RESP: 2, commandOptions: {timeout: 1234}},
    {RESP: 3, commandOptions: {timeout: 1234}},
  ];
  it.each(callerOptions)(
    'respects caller protocol and queue timeout overrides: %j',
    (options) => {
      new RedisConnection('redis://localhost/1', options, 'sessions');

      expect(createClient).toHaveBeenCalledWith({
        url: 'redis://localhost/1',
        ...options,
      });
    },
  );

  it('preserves other command options without introducing a queue timeout', () => {
    const abortController = new AbortController();
    new RedisConnection(
      'redis://localhost/1',
      {commandOptions: {abortSignal: abortController.signal}},
      'sessions',
    );

    expect(jest.mocked(createClient).mock.calls[0][0]).toStrictEqual({
      url: 'redis://localhost/1',
      RESP: 2,
      commandOptions: {
        timeout: undefined,
        abortSignal: abortController.signal,
      },
    });
  });

  it('uses a supplied client without configuring it or adding listeners', async () => {
    const connection = new RedisConnection(suppliedClient, {}, 'sessions');
    await connection.connect();

    expect(createClient).not.toHaveBeenCalled();
    expect(mockClient.on).not.toHaveBeenCalled();
    expect(mockClient.connect).toHaveBeenCalledTimes(1);

    await connection.get('key');
    expect(mockClient.get).toHaveBeenCalledWith('sessions_key');
    await connection.disconnect();
    expect(mockClient.quit).toHaveBeenCalledTimes(1);
  });

  it('does not reconnect a ready supplied client', async () => {
    mockClient.isReady = true;
    await new RedisConnection(suppliedClient, {}, 'sessions').connect();

    expect(mockClient.connect).not.toHaveBeenCalled();
  });
});
