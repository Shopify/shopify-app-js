import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Storefront API',
  description:
    'Contains objects used to interact with the Storefront API.' +
    '\n\nThis object is returned as part of different contexts, such as [`appProxy`](/docs/api/shopify-app-remix/authenticate/public/app-proxy), and [`unauthenticated.storefront`](/docs/api/shopify-app-remix/unauthenticated/unauthenticated-storefront).',
  category: 'APIs',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'storefront',
      description:
        'Provides utilities that apps can use to make requests to the Storefront API.',
      type: 'StorefrontContext',
    },
  ],
  jsDocTypeExamples: ['StorefrontContext'],
  related: [
    {
      name: 'App proxy context',
      subtitle: 'Authenticate requests from Shopify app proxies.',
      url: '/docs/api/shopify-app-remix/authenticate/public/app-proxy',
    },
    {
      name: 'Unauthenticated context',
      subtitle: 'Interact with the Storefront API on non-Shopify requests.',
      url: '/docs/api/shopify-app-remix/unauthenticated/unauthenticated-storefront',
    },
  ],
};

export default data;
