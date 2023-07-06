import {shouldPolyfill} from '@formatjs/intl-locale/should-polyfill';
import {shouldPolyfill as shouldPolyfillPlural} from '@formatjs/intl-pluralrules/should-polyfill';

import {loadPluralRulesPolyfills} from '../intl-polyfills';

jest.mock('@formatjs/intl-locale/should-polyfill', () => ({
  shouldPolyfill: jest.fn(),
}));
jest.mock('@formatjs/intl-pluralrules/should-polyfill', () => ({
  shouldPolyfill: jest.fn(),
}));

describe('Intl polyfills', () => {
  const supportedLocales = [
    'cs',
    'da',
    'de',
    'en',
    'es',
    'fi',
    'fr',
    'it',
    'ja',
    'ko',
    'nb',
    'nl',
    'pl',
    'pt',
    'pt-PT',
    'sv',
    'th',
    'tr',
    'vi',
    'zh',
  ];
  describe.each(supportedLocales)('for locale %s', (locale) => {
    beforeEach(() => {
      // Reset every module to make sure we're properly reloading things
      jest.restoreAllMocks();
      jest.resetModules();
    });

    it('can load polyfills for locale', async () => {
      // GIVEN
      (shouldPolyfill as jest.Mock).mockReturnValue(true);
      (shouldPolyfillPlural as jest.Mock).mockReturnValue(true);

      // WHEN
      await loadPluralRulesPolyfills('en', locale);

      // THEN
      expect(Intl.Locale).toBeDefined();

      const rules = new Intl.PluralRules(locale);
      expect(rules.resolvedOptions().locale).toBe(locale);
    });
  });
});
