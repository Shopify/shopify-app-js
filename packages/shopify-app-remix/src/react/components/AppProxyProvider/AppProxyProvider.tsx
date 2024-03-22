import {createContext, useEffect, useState} from 'react';

export interface AppProxyProviderProps {
  /**
   * The URL where the app is hosted. You can set this from the `SHOPIFY_APP_URL` environment variable.
   */
  appUrl: string;

  /**
   * The children to render.
   */
  children?: React.ReactNode;
}

type FormatUrlFunction = (
  url: string | undefined,
  addOrigin?: boolean,
) => string | undefined;

interface AppProxyProviderContextProps {
  appUrl: string;
  formatUrl: FormatUrlFunction;
  requestUrl?: URL;
}

export const AppProxyProviderContext =
  createContext<AppProxyProviderContextProps | null>(null);

/**
 * Sets up a page to render behind a Shopify app proxy, enabling JavaScript and CSS to be loaded from the app.
 *
 * Also provides components that enable using other components such as links and forms within proxies.
 *
 * > Caution:
 * Because Remix doesn't support URL rewriting, any route using this component should <b>match the pathname of the proxy
 * URL exactly</b>, and <b>end in a trailing slash</b> (e.g., `https://<shop>/apps/proxy/`).
 *
 * @example
 * <caption>Wrap a route with an AppProxyProvider component.</caption>
 * <description>Wrap your route component in the `AppProxyProvider` component and pass in your app URL.</description>
 * ```ts
 * // /app/routes/**\/*.ts
 * import {authenticate} from '~/shopify.server';
 * import {AppProxyProvider} from '@shopify/shopify-app-remix/react';
 *
 * export async function loader({ request }) {
 *   await authenticate.public.appProxy(request);
 *
 *   return json({ appUrl: process.env.SHOPIFY_APP_URL });
 * }
 *
 * export default function App() {
 *   const { appUrl } = useLoaderData();
 *
 *   return (
 *     <AppProxyProvider appUrl={appUrl}>
 *       Page content
 *     </AppProxyProvider>
 *   );
 * }
 * ```
 */
export function AppProxyProvider(props: AppProxyProviderProps) {
  const {children, appUrl} = props;
  const [requestUrl, setRequestUrl] = useState<URL | undefined>();

  useEffect(
    () => setRequestUrl(new URL(window.location.href)),
    [setRequestUrl],
  );

  return (
    <AppProxyProviderContext.Provider
      value={{appUrl, requestUrl, formatUrl: formatProxyUrl(requestUrl)}}
    >
      <base href={appUrl} />

      {children}
    </AppProxyProviderContext.Provider>
  );
}

function formatProxyUrl(requestUrl: URL | undefined): FormatUrlFunction {
  return (url: string | undefined, addOrigin = true) => {
    if (!url) {
      return url;
    }

    let finalUrl = url;

    if (addOrigin && requestUrl && finalUrl.startsWith('/')) {
      finalUrl = new URL(`${requestUrl.origin}${url}`).href;
    }
    if (!finalUrl.endsWith('/')) {
      finalUrl = `${finalUrl}/`;
    }

    return finalUrl;
  };
}
