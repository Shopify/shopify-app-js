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
    {
      title: 'WebhookContext',
      description: 'Object returned by `authenticate.webhook`.',
      type: 'WebhookContextWithSession',
      jsDocExamples: true,
    },
  ],
  related: [],
};

export default data;
