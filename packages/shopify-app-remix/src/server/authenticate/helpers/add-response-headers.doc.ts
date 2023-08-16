import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'addDocumentResponseHeaders',
  description:
    'Ensures all responses have the right headers for apps to be embedded into Shopify Admin.\n\nThis should be called on any request that returns a document.',
  category: 'reference',
  subCategory: 'server',
  type: 'function',
  isVisualComponent: false,
  definitions: [
    {
      title: 'addDocumentResponseHeaders',
      description:
        'Adds headers to the response, so that the app can be loaded in an iframe.',
      type: 'AddDocumentResponseHeadersFunction',
    },
  ],
  defaultExample: {
    description: 'Add headers to all document responses.',
    codeblock: {
      title: 'app/entry.server.jsx',
      tabs: [
        {
          code: './add-response-headers.doc.example.ts',
          language: 'ts',
          title: 'addDocumentResponseHeaders',
        },
      ],
    },
  },
  related: [],
};

export default data;
