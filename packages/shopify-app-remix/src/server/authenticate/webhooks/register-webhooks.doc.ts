import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'registerWebhooks',
  description:
    'Enables apps to register webhooks to listen to events from Shopify.',
  category: 'reference',
  subCategory: 'server',
  type: 'function',
  isVisualComponent: false,
  definitions: [
    {
      title: 'registerWebhooks',
      description: 'Sets up the configured listeners for the current session.',
      type: 'RegisterWebhooks',
    },
  ],
  defaultExample: {
    description: 'Register webhooks.',
    codeblock: {
      title: 'registerWebhooks',
      tabs: [
        {
          code: './register-webhooks.doc.example.ts',
          language: 'ts',
          title: 'registerWebhooks',
        },
      ],
    },
  },
  related: [],
};

export default data;
