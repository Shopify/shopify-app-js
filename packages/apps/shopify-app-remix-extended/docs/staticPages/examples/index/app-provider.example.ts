import {LoaderFunctionArgs} from '@remix-run/node';
import {AppProvider} from '@shopify/shopify-app-remix/react';

import shopify from '~/shopify.server';

export async function loader({request}: LoaderFunctionArgs) {
  await shopify.authenticate.admin(request);

  return json({
    apiKey: process.env.SHOPIFY_API_KEY,
  });
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
        <AppProvider apiKey={apiKey} isEmbeddedApp>
          <Outlet />
        </AppProvider>
      </body>
    </html>
  );
}
