import {LoaderFunctionArgs} from 'react-router';
import {AppProvider} from '@shopify/shopify-app-react-router/react';

import shopify from '~/shopify.server';

export async function loader({request}: LoaderFunctionArgs) {
  await shopify.authenticate.admin(request);

  return {
    apiKey: process.env.SHOPIFY_API_KEY,
  };
}

export default function App() {
  const {apiKey} = useLoaderData<typeof loader>();

  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <AppProvider apiKey={apiKey}>
          <Outlet />
        </AppProvider>
      </body>
    </html>
  );
}
