import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Customer account',
  description:
    'The `authenticate.public.customerAccount` function ensures that customer account extension requests are coming from Shopify, and returns helpers to respond with the correct headers.',
  category: 'Authenticate',
  subCategory: 'Public',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'authenticate.public.customerAccount',
      description:
        'Authenticates requests coming from Shopify customer account extensions.',
      type: 'AuthenticateCustomerAccount',
    },
  ],
  defaultExample: {
    description: 'Authenticate and return offers for the customer',
    codeblock: {
      title: 'Authenticate and return offers for the customer',
      tabs: [
        {
          title: '/app/routes/**.ts',
          language: 'typescript',
          code: './authenticate.public.customerAccount.doc.example.ts',
        },
        {
          title: '/app/offers.server.ts',
          language: 'typescript',
          code: './authenticate.public.customerAccount.doc.example.offers.ts',
        },
      ],
    },
  },
  jsDocTypeExamples: ['CustomerAccountContext'],
  related: [
    {
      name: 'Session token API',
      subtitle:
        'Customer account UI extensions API for interacting with session tokens.',
      url: '/docs/api/customer-account-ui-extensions/latest/apis/session-token',
      type: 'shopify',
    },
  ],
};

export default data;
