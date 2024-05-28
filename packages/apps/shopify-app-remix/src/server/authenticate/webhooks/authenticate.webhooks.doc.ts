import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Webhook',
  description: 'Contains functions for verifying Shopify webhooks.',
  category: 'Authenticate',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'authenticate.webhook',
      description: 'Verifies requests coming from Shopify webhooks.',
      type: 'AuthenticateWebhook',
    },
  ],
  defaultExample: {
    description: 'Update a metafield when a product is updated',
    codeblock: {
      title: 'Update a metafield when a product is updated',
      tabs: [
        {
          title: '/app/routes/**.ts',
          language: 'typescript',
          code: './authenticate.webhooks.doc.example.ts',
        },
      ],
    },
  },
  jsDocTypeExamples: ['WebhookContextWithSession'],
  related: [
    {
      name: 'Admin API context',
      subtitle: 'Interact with the Admin API.',
      url: '/docs/api/shopify-app-remix/apis/admin-api',
    },
  ],
};

export default data;
