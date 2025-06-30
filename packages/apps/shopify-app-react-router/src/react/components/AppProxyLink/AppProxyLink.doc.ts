import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'AppProxyLink',
  descriptionType: 'AppProxyLinkGeneratedType',
  description: '',
  category: 'App proxy components',
  type: 'component',
  isVisualComponent: false,
  definitions: [],
  jsDocTypeExamples: ['AppProxyLinkGeneratedType'],
  related: [
    {
      name: 'authenticate.public.appProxy',
      subtitle: 'Authenticating app proxy requests.',
      url: '/docs/api/shopify-app-react-router/authenticate/public/app-proxy',
      type: 'react-router',
    },
    {
      name: 'AppProxyProvider',
      subtitle: 'Enable JavaScript in pages loaded through app proxies.',
      url: '/docs/api/shopify-app-react-router/app-proxy-components/appproxyprovider',
      type: 'react-router',
    },
  ],
};

export default data;
