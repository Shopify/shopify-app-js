import React, {useEffect} from 'react';
import {useNavigate} from 'react-router';

interface BaseProps {
  children: React.ReactNode;
}

interface EmbeddedProps extends BaseProps {
  /**
   * If this route should be rendered inside the Shopify admin.
   *
   * Setting this to true will include the App Bridge script on the page.
   * If true and the route is loaded outside the Shopify admin, then the user will be redirected to the Shopify admin.
   *
   * Setting this to false will not include the App Bridge script on the page.
   *
   * {@link https://shopify.dev/docs/apps/admin/embedded-app-home}
   */
  embedded: true;
  /**
   * The API key for your Shopify app. This is the `Client ID` from the Partner Dashboard.
   *
   * When using the Shopify CLI, this is the `SHOPIFY_API_KEY` environment variable. If you're using the environment
   * variable, then you need to pass it from the loader to the component.
   */
  apiKey: string;
}

interface NonEmbeddedProps extends BaseProps {
  /**
   * If this route should be rendered inside the Shopify admin.
   *
   * Setting this to false means only Polaris Web components will be added to the route, not App Bridge.
   *
   * Setting this to true will include the App Bridge script on the page.
   *
   * {@link https://shopify.dev/docs/apps/admin/embedded-app-home}
   */
  embedded?: false;
}

export type AppProviderProps = NonEmbeddedProps | EmbeddedProps;

/**
 * Sets up your app to look like the admin
 *
 * Adds Polaris Web components to the route.
 * If embedded is true and apiKey is provided, then the App Bridge script will be added to the page.
 *
 * {@link https://shopify.dev/docs/apps/admin/embedded-app-home}
 * {@link https://shopify.dev/docs/api/app-home/using-polaris-components}
 * {@link https://shopify.dev/tools/app-bridge}
 *
 * @example
 * <caption>Set up AppProvider for an embedded route</caption>
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
 *     <AppProvider embedded apiKey={apiKey}>
 *       <Outlet />
 *     </AppProvider>
 *   );
 * }
 * ```
 *
 * @example
 * <caption>Set up AppProvider for a non-embedded route</caption>
 * <description>Add Polaris web components to the route, without adding the App Bridge script.</description>
 * ```ts
 * // /app/routes/**\/*.ts
 * import {AppProvider} from '@shopify/shopify-app-react-router/react';
 *
 * export default function App() {
 *   return (
 *     <AppProvider embedded={false}>
 *       <Outlet />
 *     </AppProvider>
 *   );
 * }
 * ```
 */
export function AppProvider(props: AppProviderProps) {
  return (
    <>
      {props.embedded && <AppBridge apiKey={props.apiKey} />}
      <script src="https://cdn.shopify.com/shopifycloud/app-bridge-ui-experimental.js" />
      {props.children}
    </>
  );
}

interface AppBridgeProps {
  apiKey: EmbeddedProps['apiKey'];
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
