import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Admin API',
  description:
    'Contains objects used to interact with the Admin API.' +
    '\n\nThis object is returned as part of different contexts, such as [`admin`](/docs/api/shopify-app-remix/authenticate/admin), [`unauthenticated.admin`](/docs/api/shopify-app-remix/unauthenticated/unauthenticated-admin), and [`webhook`](/docs/api/shopify-app-remix/authenticate/webhook).',
  category: 'APIs',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'admin',
      description:
        'Provides utilities that apps can use to make requests to the Admin API.',
      type: 'AdminApiContext',
    },
  ],
  jsDocTypeExamples: ['AdminApiContext'],
  related: [
    {
      name: 'Authenticated context',
      subtitle: 'Authenticate requests from Shopify Admin.',
      url: '/docs/api/shopify-app-remix/authenticate/admin',
    },
    {
      name: 'Unauthenticated context',
      subtitle: 'Interact with the Admin API on non-Shopify requests.',
      url: '/docs/api/shopify-app-remix/unauthenticated/unauthenticated-admin',
    },
  ],
};

export default data;
