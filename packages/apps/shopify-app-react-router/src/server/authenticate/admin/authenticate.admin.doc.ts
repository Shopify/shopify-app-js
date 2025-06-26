import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Admin',
  description:
    'Contains methods for authenticating and interacting with the Admin API.\n\nThis function can handle requests for apps embedded in the Admin, Admin extensions, or non-embedded apps.',
  category: 'Authenticate',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'authenticate.admin',
      description:
        'Authenticates requests coming from the Shopify admin.\n\n> Note: The shape of the returned object changes depending on the `distribution` config. Merchant custom apps (`AppDistribution.ShopifyAdmin`) are not embedded so do not return session tokens or redirect functionality. All other distributions are embedded and so they return a context with session tokens and redirect functionality.',
      type: 'AuthenticateAdmin',
    },
  ],
  defaultExample: {
    description: 'Authenticate, run API mutation, and redirect',
    codeblock: {
      title: 'Authenticate, run API mutation, and redirect',
      tabs: [
        {
          title: '/app/routes/**.ts',
          language: 'typescript',
          code: './authenticate.admin.doc.example.ts',
        },
      ],
    },
  },
  jsDocTypeExamples: [
    'EmbeddedAdminContext',
    'AdminApiContext',
    'BillingContext',
    'ScopesApiContext',
  ],
  related: [
    {
      name: 'API context',
      subtitle: 'Interact with the Admin API.',
      url: '/docs/api/shopify-app-react-router/apis/admin-api',
    },
    {
      name: 'Billing context',
      subtitle: 'Bill merchants for your app using the Admin API.',
      url: '/docs/api/shopify-app-react-router/apis/billing',
    },
  ],
};

export default data;
