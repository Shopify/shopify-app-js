import {useContext} from 'react';

import {AppProxyProviderContext} from '../AppProxyProvider';

export interface AppProxyLinkProps
  extends React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > {
  href: string;
}

/**
 * Sets up an `<a />` HTML element that works when rendered behind an app proxy.
 *
 * Supports any properties accepted by the `<a />` HTML element.
 *
 * @example
 * <caption>Link to a different route.</caption>
 * <description>Use an `AppProxyLink` within an `AppProxyProvider` to link to a different proxied route.</description>
 * ```ts
 * // /app/routes/**\/*.ts
 * import {authenticate} from '~/shopify.server';
 * import {AppProxyProvider, AppProxyLink} from '@shopify/shopify-app-remix/react';
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
 *       <AppProxyLink href="/other-proxy-route">Link to another route</AppProxyLink>
 *     </AppProxyProvider>
 *   );
 * }
 * ```
 */
export function AppProxyLink(props: AppProxyLinkProps) {
  const context = useContext(AppProxyProviderContext);

  if (!context) {
    throw new Error(
      'AppProxyLink must be used within an AppProxyProvider component',
    );
  }

  const {children, href, ...otherProps} = props;

  return (
    <a href={context.formatUrl(href)} {...otherProps}>
      {children}
    </a>
  );
}
