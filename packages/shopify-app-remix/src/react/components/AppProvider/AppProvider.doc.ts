import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'AppProvider',
  descriptionType: 'AppProviderGeneratedType',
  description: '',
  category: 'entrypoints',
  type: 'component',
  isVisualComponent: false,
  defaultExample: {
    codeblock: {
      tabs: [
        {
          code: './AppProvider.doc.example.tsx',
          language: 'ts',
        },
      ],
      title: 'AppProvider',
    },
  },
  definitions: [
    {
      title: 'props',
      description: 'React component that sets up App Bridge and Polaris.',
      type: 'AppProviderProps',
    },
  ],
  related: [
    {
      name: 'Reference',
      subtitle: 'Integrate your app with Shopify.',
      url: '/docs/api/shopify-app-remix/reference',
    },
    {
      name: 'App bridge',
      subtitle: 'Learn more about App Bridge.',
      url: '/docs/api/app-bridge-library',
      type: 'shopify',
    },
    {
      name: 'Polaris',
      subtitle: 'Learn more about Polaris.',
      url: '/docs/apps/tools/polaris',
      type: 'shopify',
    },
  ],
};

export default data;
