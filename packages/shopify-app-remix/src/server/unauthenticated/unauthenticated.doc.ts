import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'unauthenticated',
  description:
    'Contains functions to obtain unauthenticated contexts from requests not sent by Shopify.\n\n> Caution: These functions do not perform **any** validation and should **never** rely on user input.',
  category: 'reference',
  subCategory: 'server',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'unauthenticated',
      description: 'Obtain unauthenticated contexts.',
      type: 'Unauthenticated',
    },
  ],
  examples: {
    description: 'How to create unauthenticated contexts.',
    examples: [
      {
        description: 'Create a context from a shop domain.',
        codeblock: {
          title: 'Admin',
          tabs: [
            {
              code: './unauthenticated.admin.doc.example.ts',
              language: 'ts',
              title: 'Admin',
            },
          ],
        },
      },
    ],
  },
  related: [],
};

export default data;
