import {InitOptions} from 'i18next';
import {shouldPolyfill} from '@formatjs/intl-locale/should-polyfill';
import {shouldPolyfill as shouldPolyfillPlural} from '@formatjs/intl-pluralrules/should-polyfill';
import LanguageDetector from 'i18next-browser-languagedetector';

import {initI18nextClient} from '../init-client';
import * as polyfillModule from '../intl-polyfills';

jest.mock('@formatjs/intl-locale/should-polyfill', () => ({
  shouldPolyfill: jest.fn(),
}));
jest.mock('@formatjs/intl-pluralrules/should-polyfill', () => ({
  shouldPolyfill: jest.fn(),
}));
jest.spyOn(LanguageDetector.prototype, 'detect');

const consoleMock = jest.spyOn(console, 'log');

describe('initI18nextClient', () => {
  beforeAll(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('sets up polyfills', async () => {
    // GIVEN
    mockDetection('fr');
    const options: InitOptions = {};

    // WHEN
    const i18next = await initI18nextClient(options);
    await i18next.init(options);

    // THEN
    // We're detecting the French locale
    const frRules = new Intl.PluralRules('fr');
    expect(frRules.resolvedOptions().locale).toBe('fr');

    // English is the fallback
    const enRules = new Intl.PluralRules('en');
    expect(enRules.resolvedOptions().locale).toBe('en');
  });

  it('follows the configured fallback language', async () => {
    // GIVEN
    mockDetection('en');
    const options: InitOptions = {
      fallbackLng: 'es',
    };

    // WHEN
    const i18next = await initI18nextClient(options);
    await i18next.init(options);

    // THEN
    // We're detecting the French locale
    const esRules = new Intl.PluralRules('es');
    expect(esRules.resolvedOptions().locale).toBe('es');

    // English is the fallback
    const enRules = new Intl.PluralRules('en');
    expect(enRules.resolvedOptions().locale).toBe('en');
  });

  it('can handle locales as an array', async () => {
    // GIVEN
    mockDetection(['fr']);
    const options: InitOptions = {};

    // WHEN
    const i18next = await initI18nextClient(options);
    await i18next.init(options);

    // THEN
    const rules = new Intl.PluralRules('fr');
    expect(rules.resolvedOptions().locale).toBe('fr');
  });

  it('falls back to English if detection returns nothing', async () => {
    // GIVEN
    mockDetection(undefined);
    const options: InitOptions = {};

    // WHEN
    const i18next = await initI18nextClient(options);
    await i18next.init(options);

    // THEN
    const rules = new Intl.PluralRules('es');
    expect(rules.resolvedOptions().locale).toBe('es');
  });

  it('throws if the polyfill fails to load', async () => {
    // GIVEN
    mockDetection('en');
    const options: InitOptions = {};
    jest
      .spyOn(polyfillModule, 'loadPluralRulesPolyfills')
      .mockRejectedValue(new Error('Failed to load polyfills'));

    // WHEN
    const i18next = await initI18nextClient(options);
    await i18next.init(options);

    // THEN
    expect(consoleMock).toHaveBeenCalled();
  });

  function mockDetection(locale: string | string[] | undefined) {
    (shouldPolyfill as jest.Mock).mockReturnValue(true);
    (shouldPolyfillPlural as jest.Mock).mockReturnValue(true);
    (LanguageDetector.prototype.detect as jest.Mock).mockReturnValue(locale);
  }
});
