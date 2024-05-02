import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'AppProvider',
  descriptionType: 'AppProviderGeneratedType',
  description: '',
  category: 'Entrypoints',
  type: 'component',
  isVisualComponent: false,
  definitions: [
    {
      title: 'AppProviderProps',
      description: 'Props for the `AppProvider` component.',
      type: 'AppProviderProps',
      filePath: 'src/react/components/AppProvider/AppProvider.tsx',
    },
  ],
  jsDocTypeExamples: ['AppProviderGeneratedType'],
  related: [
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
