import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Flow',
  description:
    'Contains functions for verifying Shopify Flow extensions.' +
    '\n\nSee the [Flow documentation](https://shopify.dev/docs/apps/flow/actions/endpoints) for more information.',
  category: 'Authenticate',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'authenticate.flow',
      description: 'Verifies requests coming from Shopify Flow extensions.',
      type: 'AuthenticateFlow',
    },
  ],
  jsDocTypeExamples: ['FlowContext'],
  related: [
    {
      name: 'Admin API context',
      subtitle: 'Interact with the Admin API.',
      url: '/docs/api/shopify-app-remix/apis/admin-api',
    },
    {
      name: 'Flow action endpoints',
      subtitle: 'Receive requests from Flow.',
      url: '/docs/apps/flow/actions/endpoints',
      type: 'shopify',
    },
  ],
};

export default data;
