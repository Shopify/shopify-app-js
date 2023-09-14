import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Billing',
  description:
    'Contains function used to bill merchants for your app.\n\nThis object is returned on authenticated Admin requests. Refer to the [Related](#related) section for more information.',
  category: 'backend',
  subCategory: 'admin features',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'billing',
      description:
        'Provides utilities that apps can use to request billing for the app using the Admin API.',
      type: 'BillingContext',
      jsDocExamples: true,
    },
  ],
  related: [
    {
      name: 'Admin context',
      subtitle: 'Authenticate requests from Shopify Admin.',
      url: '/docs/api/shopify-app-remix/backend/authenticate/admin',
    },
  ],
};

export default data;
