import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'AppProxyForm',
  descriptionType: 'AppProxyFormGeneratedType',
  description: '',
  category: 'App proxy components',
  type: 'component',
  isVisualComponent: false,
  definitions: [],
  jsDocTypeExamples: ['AppProxyFormGeneratedType'],
  related: [
    {
      name: 'authenticate.public.appProxy',
      subtitle: 'Authenticating app proxy requests.',
      url: '/docs/api/shopify-app-remix/authenticate/public/app-proxy',
      type: 'remix',
    },
    {
      name: 'AppProxyProvider',
      subtitle: 'Enable JavaScript in pages loaded through app proxies.',
      url: '/docs/api/shopify-app-remix/app-proxy-components/appproxyprovider',
      type: 'remix',
    },
  ],
};

export default data;
