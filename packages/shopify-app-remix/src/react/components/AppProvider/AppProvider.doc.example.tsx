import {AppProvider} from '@shopify/shopify-app-remix/react';

export default function App() {
  return (
    <AppProvider isEmbeddedApp apiKey="<api-key-from-partners-dashboard>">
      {/* You can use App Bridge components within the provider */}
      <ui-nav-menu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/additional">Additional page</Link>
      </ui-nav-menu>

      <Outlet />
    </AppProvider>
  );
}
