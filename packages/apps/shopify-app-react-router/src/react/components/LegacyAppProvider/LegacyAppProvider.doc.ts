import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'LegacyAppProvider',
  descriptionType: 'LegacyAppProviderGeneratedType',
  description: '',
  category: 'Entrypoints',
  type: 'component',
  isVisualComponent: false,
  definitions: [
    {
      title: 'LegacyAppProviderProps',
      description: 'Props for the `LegacyAppProvider` component.',
      type: 'LegacyAppProviderProps',
      filePath: 'src/react/components/LegacyAppProvider/LegacyAppProvider.tsx',
    },
  ],
  jsDocTypeExamples: ['LegacyAppProviderGeneratedType'],
  related: [
    {
      name: 'AppProvider',
      subtitle: 'Learn about the new AppProvider',
      url: '/docs/api/shopify-app-react-router/entrypoints/appprovider',
      type: 'shopify',
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
