import fetchMock, {MockParams} from 'jest-fetch-mock';

interface MockExternalRequestArg {
  request?: Request;
  response: Response;
}

interface ResponseParams {
  body: string;
  init: MockParams;
}

let requestMocks: MockExternalRequestArg[] = [];

let skipMockChecksFlag = false;

export async function mockExternalRequest({
  request,
  response,
}: MockExternalRequestArg) {
  requestMocks.push({request, response});

  const {body, init} = await mockParams(response);
  fetchMock.mockResponse(body, init);
}

export async function mockExternalRequests(...mocks: MockExternalRequestArg[]) {
  const parsedResponses: [string, MockParams][] = [];
  for (const mock of mocks) {
    const {request, response} = mock;

    requestMocks.push({request, response});

    const {body, init} = await mockParams(response);
    parsedResponses.push([body, init]);
  }

  fetchMock.mockResponses(...parsedResponses);
}

async function mockParams(response: Response): Promise<ResponseParams> {
  return {
    body: await response.text(),
    init: {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'content-type': 'application/json',
      },
    },
  };
}

export async function validateMocks() {
  if (requestMocks.length === 0 && fetchMock.mock.calls.length === 0) {
    return;
  }

  let matchedRequests = 0;

  for (const [index, requestMock] of requestMocks.entries()) {
    const {request} = requestMock;

    if (fetchMock.mock.calls.length === 0) {
      continue;
    }

    matchedRequests++;
    const [url, init] = fetchMock.mock.calls[index];

    const expected: Record<string, any> = {};
    const actual: Record<string, any> = {};

    if (request?.url) {
      expected.url = new URL(request.url);
      actual.url = new URL(url as string);
    }

    if (request?.method) {
      expected.method = request.method;
      actual.method = init?.method || 'GET';
    }

    if (request?.body) {
      const bodyBuffer = await stream2buffer(request.body);
      const bodyString = new TextDecoder('utf-8').decode(bodyBuffer);

      expected.body = expect.stringContaining(bodyString);
      actual.body = init?.body?.toString();
    }

    if (request?.headers) {
      expected.headers = {};
      actual.headers = {};

      // eslint-disable-next-line no-warning-comments
      // TODO: we're currently not checking the headers properly. We should fix this.
      Object.entries(request.headers).forEach(([key, value]) => {
        expected.headers[key] = value;
        actual.headers[key] = (init?.headers as any)[key];
      });
    }

    try {
      expect(actual).toEqual(expected);
    } catch (error) {
      error.message = `${init?.method} request made to ${url} does not match expectation:\n\n${error.message}`;
      throw error;
    }
  }

  if (requestMocks.length > matchedRequests) {
    throw new Error(
      `Expected ${
        requestMocks.length
      } request(s) to be made but they were not:\n\n${JSON.stringify(
        requestMocks,
        null,
        2,
      )}`,
    );
  }

  if (fetchMock.mock.calls.length > matchedRequests) {
    throw new Error(
      `${
        fetchMock.mock.calls.length
      } unexpected request(s) were made, make sure to mock all expected requests:\n\n${JSON.stringify(
        fetchMock.mock.calls,
        null,
        2,
      )}`,
    );
  }
}

async function stream2buffer(
  stream: ReadableStream<Uint8Array>,
): Promise<Buffer> {
  const buffers = [];

  for await (const data of stream as any) {
    if (typeof data === 'number') {
      buffers.push(Uint8Array.from([data]));
    } else {
      buffers.push(data);
    }
  }

  return Buffer.concat(buffers);
}

export function skipMockChecks(value: boolean) {
  skipMockChecksFlag = value;
}

beforeEach(() => {
  skipMockChecksFlag = false;
  requestMocks = [];
  fetchMock.resetMocks();
});

afterEach(async () => {
  if (!skipMockChecksFlag) {
    await validateMocks();
  }
});
