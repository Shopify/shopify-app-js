import {InitOptions} from 'i18next';
import {RemixI18Next, RemixI18NextOption} from 'remix-i18next';

interface I18nextServerOptions {
  options: InitOptions;
  backend: RemixI18NextOption['backend'];
}

export function i18nextServer({options, backend}: I18nextServerOptions) {
  return new RemixI18Next({
    detection: {
      supportedLanguages: options.supportedLngs as string[],
      fallbackLanguage: options.fallbackLng as string,
      searchParamKey: 'locale',
      order: ['header', 'searchParams'],
    },
    i18next: options,
    backend,
  });
}
