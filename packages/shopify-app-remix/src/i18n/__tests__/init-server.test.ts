import {InitOptions} from 'i18next';
import {shouldPolyfill} from '@formatjs/intl-locale/should-polyfill';
import {shouldPolyfill as shouldPolyfillPlural} from '@formatjs/intl-pluralrules/should-polyfill';

import {initI18nextServer} from '../init-server';

import {MockBackend} from './mock-backend';

jest.mock('@formatjs/intl-locale/should-polyfill', () => ({
  shouldPolyfill: jest.fn(),
}));
jest.mock('@formatjs/intl-pluralrules/should-polyfill', () => ({
  shouldPolyfill: jest.fn(),
}));

const VALID_OPTIONS: InitOptions = {
  supportedLngs: ['en', 'fr'],
  fallbackLng: 'en',
};

describe('initI18nextServer', () => {
  beforeAll(() => {
    // jest.restoreAllMocks();
  });

  afterAll(() => {
    // jest.restoreAllMocks();
  });

  it('sets up polyfills', async () => {
    // GIVEN
    mockPolyfillCalls();
    const options: InitOptions = {...VALID_OPTIONS};
    const request = new Request('https://my-example.shopify.io?locale=fr');

    // WHEN
    const i18next = await initI18nextServer({
      request,
      options,
      backend: MockBackend,
    });
    await i18next.init(options);

    // THEN
    expect(Intl.Locale).toBeDefined();

    // We're detecting the French locale
    const frRules = new Intl.PluralRules('fr');
    expect(frRules.resolvedOptions().locale).toBe('fr');

    // English is the fallback
    const enRules = new Intl.PluralRules('en');
    expect(enRules.resolvedOptions().locale).toBe('en');

    expect(options.lng).toBe('fr');
  });

  it('uses the fallbackLng properly', async () => {
    // GIVEN
    mockPolyfillCalls();
    const options: InitOptions = {...VALID_OPTIONS};
    const request = new Request('https://my-example.shopify.io');

    // WHEN
    const i18next = await initI18nextServer({
      request,
      options,
      backend: MockBackend,
    });
    await i18next.init(options);

    // THEN
    expect(options.lng).toBe('en');
  });

  it("doesn't override the lng property if it's already set", async () => {
    // GIVEN
    mockPolyfillCalls();
    const options: InitOptions = {...VALID_OPTIONS, lng: 'fr'};
    const request = new Request('https://my-example.shopify.io');

    // WHEN
    const i18next = await initI18nextServer({
      request,
      options,
      backend: MockBackend,
    });
    await i18next.init(options);

    // THEN
    expect(options.lng).toBe('fr');
  });

  function mockPolyfillCalls(data: {[key: string]: any} = {}) {
    (shouldPolyfill as jest.Mock).mockReturnValue(true);
    (shouldPolyfillPlural as jest.Mock).mockReturnValue(true);

    MockBackend.readMock.mockImplementation((_a, _b, callback) =>
      callback(data),
    );
  }
});
