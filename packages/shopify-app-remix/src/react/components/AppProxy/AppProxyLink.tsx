import {useEffect, useState} from 'react';

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
 * <description>Use an `AppProxy.Link` within an `AppProxy` to link to a different route.</description>
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
 *       <AppProxy.Link href="/other-route">Link to another route</AppProxy.Link>
 *     </AppProxy>
 *   );
 * }
 * ```
 */
export function AppProxyLink(props: AppProxyLinkProps) {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, [setOrigin]);

  const {children, href, ...otherProps} = props;

  return (
    <a href={`${origin}${href.replace(/([^/])$/, '$1/')}`} {...otherProps}>
      {children}
    </a>
  );
}
