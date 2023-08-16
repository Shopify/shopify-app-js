import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'sessionStorage',
  description:
    'Enables apps to manage sessions used by the Remix package to authenticate users and requests.',
  category: 'reference',
  subCategory: 'server',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'sessionStorage',
      description: '',
      // TODO this should be SessionStorage
      type: 'SessionStorageType',
    },
  ],
  defaultExample: {
    description: 'Save and load Shopify sessions.',
    codeblock: {
      title: 'SessionStorage',
      tabs: [
        {
          code: './session-storage.doc.example.ts',
          language: 'ts',
          title: 'SessionStorage',
        },
      ],
    },
  },
  related: [],
};

export default data;
