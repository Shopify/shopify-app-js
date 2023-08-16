import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'authenticate',
  description:
    'Contains functions to authenticate requests from different Shopify surfaces. It can be used to validate requests coming from Shopify Admin, webhooks or extensions.',
  category: 'reference',
  subCategory: 'server',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'authenticate',
      description:
        'Authenticate requests from Shopify. Different Shopify surfaces use different authentication methods, use the methods in this object to easily verify that calls are coming from Shopify.',
      type: 'Authenticate',
    },
  ],
  examples: {
    description: 'How to authenticate requests from the Shopify platform.',
    examples: [
      {
        description: 'Authenticate requests coming from Shopify Admin.',
        codeblock: {
          title: 'Admin',
          tabs: [
            {
              code: './authenticate.admin.doc.example.ts',
              language: 'ts',
              title: 'Admin',
            },
          ],
        },
      },
      {
        description:
          'Authenticate public request coming from Shopify checkout extensions.',
        codeblock: {
          title: 'Public',
          tabs: [
            {
              code: './authenticate.public.doc.example.ts',
              language: 'ts',
              title: 'Public',
            },
          ],
        },
      },
      {
        description: 'Authenticate webhooks coming from Shopify.',
        codeblock: {
          title: 'Webhook',
          tabs: [
            {
              code: './authenticate.webhook.doc.example.ts',
              language: 'ts',
              title: 'Webhook',
            },
          ],
        },
      },
    ],
  },
  related: [],
};

export default data;
