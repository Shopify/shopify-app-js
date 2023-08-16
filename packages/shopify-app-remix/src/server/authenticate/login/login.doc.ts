import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'login',
  description:
    'Logs a store into the app via Shopify, requesting merchant permissions if it is not installed yet.\n\nIf successful, the merchant will be automatically redirected.\n\nThis function is only available for apps using the `AppDistribution.AppStore` value for `distribution`.',
  category: 'reference',
  subCategory: 'server',
  type: 'function',
  isVisualComponent: false,
  definitions: [
    {
      title: 'login',
      description:
        'Obtains a shop from either the search params or POST form data, and triggers a login process.',
      type: 'Login',
    },
  ],
  defaultExample: {
    description: 'Log a store in.',
    codeblock: {
      title: 'Login',
      tabs: [
        {
          code: './login.doc.example.ts',
          language: 'ts',
          title: 'Login',
        },
      ],
    },
  },
  related: [],
};

export default data;
