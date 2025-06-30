import React, {useEffect} from 'react';
import {useNavigate} from 'react-router';

interface BaseProps {
  children: React.ReactNode;
}

interface EmbeddedProps extends BaseProps {
  embedded: true;
  apiKey: string;
}

interface NonEmbeddedProps extends BaseProps {
  embedded?: false;
}

export type AppProviderProps = NonEmbeddedProps | EmbeddedProps;

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
