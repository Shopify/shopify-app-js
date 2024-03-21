import {AppProxyForm} from './AppProxyForm';
import {AppProxyLink} from './AppProxyLink';

export interface AppProxyProps {
  /**
   * The URL where the app is hosted. You can set this from the `SHOPIFY_APP_URL` environment variable.
   */
  appUrl: string;

  /**
   * The children to render.
   */
  children?: React.ReactNode;
}
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
 * <caption>Wrap a route with an AppProxy component.</caption>
 * <description>Wrap your route component in the `AppProxy` component and pass in your app URL.</description>
 * ```ts
 * import {authenticate} from '~/shopify.server';
 * import {AppProxy} from '@shopify/shopify-app-remix/react';
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
 *     <AppProxy appUrl={appUrl}>
 *       Page content
 *     </AppProxy>
 *   );
 * }
 * ```
 */
export function AppProxy(props: AppProxyProps) {
  const {children, appUrl} = props;

  return (
    <>
      <base href={appUrl} />

      {children}
    </>
  );
}

AppProxy.Form = AppProxyForm;
AppProxy.Link = AppProxyLink;
