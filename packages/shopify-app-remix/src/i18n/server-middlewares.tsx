import {InitOptions, Module} from 'i18next';
import {RemixI18NextOption} from 'remix-i18next';
import ShopifyFormat from '@shopify/i18next-shopify';

import {loadLocalePolyfills, loadPluralRulesPolyfills} from './intl-polyfills';
import {i18nextServer} from './server';

interface I18nServerMiddlewaresOptions {
  request: Request;
  options: InitOptions;
  backend: RemixI18NextOption['backend'];
}

export async function serverMiddlewares({
  request,
  options,
  backend,
}: I18nServerMiddlewaresOptions): Promise<Module[]> {
  await loadLocalePolyfills();

  const lng = await i18nextServer({options, backend}).getLocale(request);

  await loadPluralRulesPolyfills(options.fallbackLng as string, lng);

  return [ShopifyFormat, backend];
}
