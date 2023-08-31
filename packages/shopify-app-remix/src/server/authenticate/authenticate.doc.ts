import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Authenticate overview',
  description:
    'Contains functions to authenticate requests from different Shopify surfaces. It can be used to validate requests coming from Shopify Admin, webhooks or extensions.\n\nGo to the [Related](#related) section to see all supported actions in `admin`, `webhook` and `public`.',
  category: 'backend',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'authenticate',
      description:
        'Authenticate requests from Shopify. Different Shopify surfaces use different authentication methods, use the methods in this object to easily verify that calls are coming from Shopify.',
      type: 'Authenticate',
      jsDocExamples: true,
    },
  ],
  related: [
    {
      name: 'Admin context',
      subtitle: 'Authenticate requests from Shopify Admin.',
      url: '/docs/api/shopify-app-remix/backend/authenticate/admin',
    },
    {
      name: 'Webhook context',
      subtitle: 'Authenticate Shopify webhook requests.',
      url: '/docs/api/shopify-app-remix/backend/authenticate/webhook',
    },
    {
      name: 'Public context',
      subtitle: 'Authenticate checkout extension requests.',
      url: '/docs/api/shopify-app-remix/backend/authenticate/public',
    },
  ],
};

export default data;
