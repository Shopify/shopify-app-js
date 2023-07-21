import React from 'react';
import {AppProvider as PolarisAppProvider} from '@shopify/polaris';
import translations from '@shopify/polaris/locales/en.json';

import {APP_BRIDGE_URL} from '../const';

import {RemixPolarisLink} from './RemixPolarisLink';

export interface AppProviderProps {
  children: React.ReactNode;
  /**
   * The API key for your Shopify app.
   */
  apiKey: string;
  /**
   * Whether the app is embedded or not. Defaults to `true`.
   */
  isEmbeddedApp?: boolean;
  /**
   * Used internally by Shopify. You should not need to set this.
   * @internal
   */
  __APP_BRIDGE_URL?: string;
}

/**
 * Sets up the Polaris AppProvider and injects the App Bridge script.
 *
 * {@link https://polaris.shopify.com/components/utilities/app-provider}
 * {@link https://shopify.dev/tools/app-bridge}
 *
 * @example
 * Wrap your app in the `AppProvider` component and pass in your API key.
 * ```ts
 * import {authenticate} from '~/shopify.server';
 * import {AppProvider} from '@shopify/shopify-app-remix/react';
 *
 * export async function loader({ request }) {
 *   await authenticate.admin(request);
 *
 *   return json({ apiKey: process.env.SHOPIFY_API_KEY });
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
export function AppProvider({
  children,
  apiKey,
  isEmbeddedApp = true,
  __APP_BRIDGE_URL = APP_BRIDGE_URL,
}: AppProviderProps) {
  return (
    <>
      {isEmbeddedApp && <script src={__APP_BRIDGE_URL} data-api-key={apiKey} />}
      <PolarisAppProvider i18n={translations} linkComponent={RemixPolarisLink}>
        {children}
      </PolarisAppProvider>
    </>
  );
}
