import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'AppProxyProvider',
  descriptionType: 'AppProxyProviderGeneratedType',
  description: '',
  category: 'Entrypoints',
  type: 'component',
  isVisualComponent: false,
  definitions: [
    {
      title: 'AppProxyProviderProps',
      description: 'Props for the `AppProxyProvider` component.',
      type: 'AppProxyProviderProps',
    },
  ],
  jsDocTypeExamples: ['AppProxyProviderGeneratedType'],
  related: [
    {
      name: 'authenticate.public.appProxy',
      subtitle: 'Authenticate app proxy requests.',
      url: '/docs/api/shopify-app-react-router/authenticate/public/app-proxy',
      type: 'remix',
    },
    {
      name: 'AppProxyLink',
      subtitle: 'Create links that work within app proxies.',
      url: '/docs/api/shopify-app-react-router/app-proxy-components/appproxylink',
      type: 'react-router',
    },
  ],
};

export default data;
