import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Unauthenticated overview',
  description:
    'Contains functions to obtain unauthenticated contexts from requests not sent by Shopify.\n\n> Caution: These functions should only be used for Requests that do not originate from Shopify.\n> You must do your own authentication before using them.\n>These functions do not perform **any** validation and should **never** rely on user input.',
  category: 'backend',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'unauthenticated',
      description: 'Obtain unauthenticated contexts.',
      type: 'Unauthenticated',
      jsDocExamples: true,
    },
  ],
  related: [
    {
      name: 'Admin context',
      subtitle: 'Interact with the Admin API on non-Shopify requests.',
      url: '/docs/api/shopify-app-remix/backend/unauthenticated-admin',
    },
  ],
};

export default data;
