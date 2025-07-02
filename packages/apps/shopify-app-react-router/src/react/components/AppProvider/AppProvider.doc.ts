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
    },
  ],
  jsDocTypeExamples: ['AppProviderGeneratedType'],
  related: [
    {
      name: 'Polaris Web components',
      subtitle: 'Learn more about Polaris Web components.',
      url: '/docs/api/app-home/using-polaris-components',
      type: 'shopify',
    },
    {
      name: 'App bridge',
      subtitle: 'Learn more about App Bridge.',
      url: '/docs/api/app-bridge-library',
      type: 'shopify',
    },
  ],
};

export default data;
