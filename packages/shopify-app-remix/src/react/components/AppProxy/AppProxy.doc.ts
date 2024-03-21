import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'AppProxy',
  descriptionType: 'AppProxyGeneratedType',
  description: '',
  category: 'App proxy components',
  type: 'component',
  isVisualComponent: false,
  definitions: [
    {
      title: 'AppProxyProps',
      description: 'Props for the `AppProxy` component.',
      type: 'AppProxyProps',
    },
  ],
  jsDocTypeExamples: ['AppProxyGeneratedType'],
  related: [
    {
      name: 'authenticate.public.appProxy',
      subtitle: 'Authenticate app proxy requests.',
      url: '/docs/api/shopify-app-remix/authenticate/public/app-proxy',
      type: 'remix',
    },
    {
      name: 'AppProxy.Form',
      subtitle: 'Render form elements in proxies.',
      url: '/docs/api/shopify-app-remix/app-proxy-components/appproxy-form',
      type: 'remix',
    },
    {
      name: 'AppProxy.Link',
      subtitle: 'Render link elements in proxies.',
      url: '/docs/api/shopify-app-remix/app-proxy-components/appproxy-link',
      type: 'remix',
    },
  ],
};

export default data;
