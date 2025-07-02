import type {HeadersFunction, LoaderFunctionArgs} from 'react-router';
import {Link, Outlet, useLoaderData, useRouteError} from 'react-router';
import {boundary} from '@shopify/shopify-app-react-router/server';
import {NavMenu} from '@shopify/app-bridge-react';
import {AppProvider} from '@shopify/shopify-app-react-router/react';

import {authenticate} from '../shopify.server';

export const loader = async ({request}: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return {apiKey: process.env.SHOPIFY_API_KEY || ''};
};

export default function App() {
  const {apiKey} = useLoaderData<typeof loader>();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/additional">Additional page</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
