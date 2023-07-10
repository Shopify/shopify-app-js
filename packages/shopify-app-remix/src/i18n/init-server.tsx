import i18next, {
  BackendModule,
  InitOptions,
  NewableModule,
  i18n,
} from 'i18next';
import ShopifyFormat from '@shopify/i18next-shopify';

import {loadLocalePolyfills, loadPluralRulesPolyfills} from './intl-polyfills';
import {i18nextServer} from './server';
import {getFallbackLng} from './get-fallback-language';

interface InitI18nServerOptions {
  request: Request;
  options: InitOptions;
  backend: NewableModule<BackendModule>;
}

export async function initI18nextServer({
  request,
  options,
  backend,
}: InitI18nServerOptions): Promise<i18n> {
  await loadLocalePolyfills();

  const lng = await i18nextServer({options, backend}).getLocale(request);
  const fallbackLng = getFallbackLng(options.fallbackLng, lng);

  await loadPluralRulesPolyfills(fallbackLng, lng);

  // Make sure we're setting the lng on the options object if it's not already there
  if (!options.lng) {
    options.lng = lng;
  }

  return i18next.use(ShopifyFormat).use(backend);
}
