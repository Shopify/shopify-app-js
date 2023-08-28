import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Authenticate Admin',
  description:
    'Contains functions for authenticating and interacting with the Admin API.\n\nThis function can handle both requests for apps embedded in the Admin, or Admin extensions.\n\nGo to the [Related](#related) section to see all supported actions in `admin` and `billing`.',
  category: 'backend',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'authenticate.admin',
      description:
        'Authenticates requests coming from Shopify Admin.\n\nThe shape of the returned object changes depending on the `isEmbeddedApp` config.',
      type: 'AuthenticateAdmin',
    },
    {
      title: 'AdminContext',
      description: 'Object returned by `authenticate.admin`.',
      type: 'EmbeddedAdminContext',
      jsDocExamples: true,
    },
  ],
  related: [
    {
      name: 'API context',
      subtitle: 'Interact with the Admin API.',
      url: '/docs/api/shopify-app-remix/backend/admin-features/admin-api',
    },
    {
      name: 'Billing context',
      subtitle: 'Bill merchants for your app using the Admin API.',
      url: '/docs/api/shopify-app-remix/backend/admin-features/billing',
    },
  ],
};

export default data;
