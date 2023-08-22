import React from 'react';

import {boundary} from '../../index';

describe('Error boundary', () => {
  it('returns a string when handling an ErrorResponse', () => {
    // WHEN
    const result = boundary.error(new ErrorResponse());

    // THEN
    expect(result).toEqual(
      <div dangerouslySetInnerHTML={{__html: 'Handling response'}} />,
    );
  });

  it('throws an error when handling an unknown error', () => {
    // WHEN
    const result = () => boundary.error(new Error());

    // THEN
    expect(result).toThrowError();
  });
});

class ErrorResponse extends Error {}
