import {
  InitOptions,
  LanguageDetectorAsyncModule,
  Module,
  Services,
} from 'i18next';
import ShopifyFormat from '@shopify/i18next-shopify';
import LanguageDetector from 'i18next-browser-languagedetector';

import {loadLocalePolyfills, loadPluralRulesPolyfills} from './intl-polyfills';

class LanguageDetectorWithPolyfills implements LanguageDetectorAsyncModule {
  type: 'languageDetector' = 'languageDetector';
  async: true;

  private detector: LanguageDetector;
  private options: InitOptions;

  init(services: Services, options: object, i18nextOptions: InitOptions): void {
    this.detector = new LanguageDetector(services, options);
    this.options = i18nextOptions;
  }

  async detect(_callback: any): Promise<string | string[] | undefined> {
    const result = this.detector.detect(this.options.detection?.order);

    await loadPluralRulesPolyfills(
      this.options.fallbackLng as string,
      result as string,
    );

    return result;
  }

  cacheUserLanguage(lng: string): void | Promise<void> {
    return this.detector.cacheUserLanguage(lng);
  }
}

export async function clientMiddlewares(): Promise<Module[]> {
  await loadLocalePolyfills();

  return [ShopifyFormat, LanguageDetectorWithPolyfills];
}
