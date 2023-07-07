import {getFallbackLng} from '../get-fallback-language';

describe('getFallbackLanguage', () => {
  it('can find the fallback language from a string', () => {
    expect(getFallbackLng('en')).toEqual('en');
  });

  it('can find the fallback language from a string aray', () => {
    expect(getFallbackLng(['en', 'en-US'])).toEqual('en');
  });

  it('can find the fallback language from an object', () => {
    expect(getFallbackLng({en: ['en', 'en-US']})).toEqual('en');
  });
});
