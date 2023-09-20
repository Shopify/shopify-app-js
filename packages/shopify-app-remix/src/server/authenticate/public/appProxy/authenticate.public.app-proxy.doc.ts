import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'App proxy',
  description:
    'The `authenticate.public.appProxy` function validates app proxy requests made by Shopify, and returns a context to enable querying Shopify APIs.',
  category: 'Authenticate',
  subCategory: 'Public',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'authenticate.public.appProxy',
      description: 'Authenticates requests coming from Shopify app proxies.',
      type: 'AuthenticateAppProxy',
    },
    {
      title: 'AppProxyContext',
      description: 'Object returned by `authenticate.public.appProxy`.',
      type: 'AppProxyContextWithSession',
    },
  ],
  jsDocTypeExamples: ['AppProxyContextWithSession', 'AdminApiContext'],
  related: [
    {
      name: 'API context',
      subtitle: 'Interact with the Admin API.',
      url: '/docs/api/shopify-app-remix/apis/admin-api',
    },
  ],
};

export default data;
