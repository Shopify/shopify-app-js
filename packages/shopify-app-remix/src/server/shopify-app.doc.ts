import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'shopifyApp',
  descriptionType: 'ShopifyAppGeneratedType',
  description: '',
  category: 'entrypoints',
  type: 'function',
  isVisualComponent: false,
  defaultExample: {
    codeblock: {
      tabs: [
        {
          code: './shopify-app.doc.example.ts',
          language: 'ts',
        },
      ],
      title: 'shopifyApp',
    },
  },
  definitions: [
    {
      title: 'shopifyApp',
      description: 'Function to create a new Shopify API object.',
      type: 'ShopifyAppGeneratedType',
    },
  ],
  related: [
    {
      name: 'Reference',
      subtitle: 'Integrate your app with Shopify.',
      url: '/docs/api/shopify-app-remix/reference',
    },
  ],
};

export default data;
