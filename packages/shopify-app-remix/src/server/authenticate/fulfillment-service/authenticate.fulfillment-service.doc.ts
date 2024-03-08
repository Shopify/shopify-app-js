import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Fulfillment Service',
  description:
    'Contains functions for verifying fulfillment service requests.' +
    '\n\nSee the [fulfillment service documentation](https://shopify.dev/docs/apps/fulfillment/fulfillment-service-apps) for more information.',
  category: 'Authenticate',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'authenticate.fulfillmentService',
      description:
        'Verifies requests coming from Shopify to fulfillment service apps',
      type: 'AuthenticateFulfillmentService',
    },
  ],
  defaultExample: {
    description: 'Handle a fulfillment service notification call',
    codeblock: {
      title: 'Consume a fulfillment service notification request',
      tabs: [
        {
          title: '/app/routes/**.ts',
          language: 'typescript',
          code: './authenticate.fulfillment-service.doc.example.ts',
        },
      ],
    },
  },
  jsDocTypeExamples: ['FulfillmentServiceContext'],
  related: [
    {
      name: 'Admin API context',
      subtitle: 'Interact with the Admin API.',
      url: '/docs/api/shopify-app-remix/apis/admin-api',
    },
    {
      name: 'Manage Fulfillments',
      subtitle: 'Receive fulfillment requests and cancellations.',
      url: '/docs/apps/fulfillment/fulfillment-service-apps/manage-fulfillments',
      type: 'shopify',
    },
  ],
};

export default data;
