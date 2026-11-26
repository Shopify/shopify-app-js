import {validateRequiredAccessTokens} from '../../validations';

describe('validateRequiredAccessToken()', () => {
  it('throws an error when both tokens are provided', () => {
    const publicAccessToken = 'publicAccessToken';
    const privateAccessToken = 'privateAccessToken';

    expect(() =>
      validateRequiredAccessTokens(publicAccessToken, privateAccessToken),
    ).toThrow(
      new Error(
        'Storefront API Client: only provide either a public or private access token',
      ),
    );
  });
});
