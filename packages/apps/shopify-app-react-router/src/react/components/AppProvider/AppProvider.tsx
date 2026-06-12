import React, {useEffect} from 'react';
import {useNavigate} from 'react-router';

/**
 * Props for the `AppProvider` component.
 * @publicDocs
 */
export interface AppProviderProps {
  /**
   * The children to render.
   */
  children: React.ReactNode;

  /**
   * The API key for your Shopify app. This is the `Client ID` from the Partner Dashboard.
   *
   * The App Bridge script will be included on the page using this API key. When using the Shopify CLI, this is the
   * `SHOPIFY_API_KEY` environment variable. If you're using the environment variable, then you need to pass it from the
   * loader to the component.
   */
  apiKey: string;
}

/**
 * Sets up your app to look like the admin
 *
 * Adds Polaris Web components and App Bridge to the route.
 *
 * {@link https://shopify.dev/docs/apps/admin/embedded-app-home}
 * {@link https://shopify.dev/docs/api/app-home/using-polaris-components}
 * {@link https://shopify.dev/tools/app-bridge}
 *
 * @example
 * <caption>Set up AppProvider for an Admin route</caption>
 * <description>Wrap your route in the `AppProvider` component and pass in your API key.</description>
 * ```ts
 * // /app/routes/**\/*.ts
 * import {useLoaderData} from 'react-router';
 * import {authenticate} from '~/shopify.server';
 * import {AppProvider} from '@shopify/shopify-app-react-router/react';
 *
 * export async function loader({ request }) {
 *   await authenticate.admin(request);
 *
 *   return { apiKey: process.env.SHOPIFY_API_KEY };
 * }
 *
 * export default function App() {
 *   const { apiKey } = useLoaderData();
 *
 *   return (
 *     <AppProvider apiKey={apiKey}>
 *       <Outlet />
 *     </AppProvider>
 *   );
 * }
 * ```
 */
export function AppProvider(props: AppProviderProps) {
  return (
    <>
      <AppBridge apiKey={props.apiKey} />
      <script src="https://cdn.shopify.com/shopifycloud/polaris.js" />
      {props.children}
    </>
  );
}

interface AppBridgeProps {
  apiKey: string;
}

function AppBridge({apiKey}: AppBridgeProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const href = (event.target as HTMLElement)?.getAttribute('href');
      if (href) {
        navigate(href);
      }
    };

    document.addEventListener('shopify:navigate', handleNavigate);

    return () => {
      document.removeEventListener('shopify:navigate', handleNavigate);
    };
  }, [navigate]);

  return (
    <script
      src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
      data-api-key={apiKey}
    />
  );
}
