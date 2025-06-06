import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Billing',
  description:
    'Contains function used to bill merchants for your app with the Billing API.\n\nThis object is returned on authenticated Admin requests.' +
    '\n\n> Note: [Managed App Pricing](/docs/apps/launch/billing/managed-pricing) is now available. Define your app’s pricing plans directly in the Shopify Partner Dashboard, without needing to use the Billing API.',
  category: 'APIs',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'billing',
      description:
        'Provides utilities that apps can use to request billing for the app using the Admin API.',
      type: 'BillingContext',
    },
  ],
  jsDocTypeExamples: ['BillingContext'],
  related: [
    {
      name: 'Admin context',
      subtitle: 'Authenticate requests from Shopify Admin.',
      url: '/docs/api/shopify-app-remix/authenticate/admin',
    },
  ],
};

export default data;
