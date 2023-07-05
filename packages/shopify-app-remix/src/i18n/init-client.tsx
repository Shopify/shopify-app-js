import i18next, {InitOptions, i18n} from 'i18next';
import ShopifyFormat from '@shopify/i18next-shopify';
import LanguageDetector from 'i18next-browser-languagedetector';

import {loadLocalePolyfills, loadPluralRulesPolyfills} from './intl-polyfills';
import {getFallbackLng} from './get-fallback-language';

export async function initI18nextClient(
  i18nextOptions: InitOptions,
): Promise<i18n> {
  await loadLocalePolyfills();

  class LanguageDetectorWithPolyfills extends LanguageDetector {
    static async = true;
    async = true;

    detect(callback: any): string | string[] | undefined {
      const result = super.detect(i18nextOptions.detection?.order);

      let resultString: string;
      if (typeof result === 'string') {
        resultString = result;
      } else if (Array.isArray(result)) {
        resultString = result[0];
      } else {
        resultString = 'en';
      }

      loadPluralRulesPolyfills(
        getFallbackLng(i18nextOptions.fallbackLng, resultString),
        resultString,
      )
        .then(() => callback(result))
        .catch(() => console.log('Failed to load i18n polyfills'));

      return result;
    }
  }

  return i18next.use(ShopifyFormat).use(LanguageDetectorWithPolyfills as any);
}
