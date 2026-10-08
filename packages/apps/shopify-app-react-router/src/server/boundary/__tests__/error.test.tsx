import {boundary} from '../../index';

describe('Error boundary', () => {
  it('returns a response body when handling a route error response', () => {
    // WHEN
    const result = boundary.error({
      status: 401,
      statusText: 'Unauthorized',
      internal: false,
      data: 'Handling response',
    });

    // THEN
    expect(result).toEqual(
      <div dangerouslySetInnerHTML={{__html: 'Handling response'}} />,
    );
  });

  it('uses the fallback body when a route error response has no data', () => {
    // WHEN
    const result = boundary.error({
      status: 500,
      statusText: 'Internal Server Error',
      internal: true,
      data: undefined,
    });

    // THEN
    expect(result).toEqual(
      <div dangerouslySetInnerHTML={{__html: 'Handling response'}} />,
    );
  });

  it('throws an error when handling an unknown error', () => {
    // WHEN
    const result = () => boundary.error(new Error());

    // THEN
    expect(result).toThrow();
  });
});
