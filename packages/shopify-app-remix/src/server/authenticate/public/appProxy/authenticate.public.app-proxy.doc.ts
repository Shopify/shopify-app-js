import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'App proxy',
  description:
    '[App proxies](/docs/apps/online-store/app-proxies) take requests to Shopify links, and redirect them to external links. The `authenticate.public.appProxy` function validates requests made to app proxies, and returns a context to enable querying Shopify APIs.',
  category: 'Authenticate',
  subCategory: 'Public',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'authenticate.public.appProxy',
      description:
        'Authenticates requests coming to the app from Shopify app proxies.',
      type: 'AuthenticateAppProxy',
    },
  ],
  jsDocTypeExamples: ['AppProxyContextWithSession'],
  related: [
    {
      name: 'Admin API context',
      subtitle: 'Interact with the Admin API.',
      url: '/docs/api/shopify-app-remix/apis/admin-api',
    },
    {
      name: 'Storefront API context',
      subtitle: 'Interact with the Storefront API.',
      url: '/docs/api/shopify-app-remix/apis/storefront-api',
    },
  ],
};

export default data;
