import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Checkout',
  description:
    'The `authenticate.public.checkout` function ensures that checkout extension requests are coming from Shopify, and returns helpers to respond with the correct headers.',
  category: 'Authenticate',
  subCategory: 'Public',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'authenticate.public.checkout',
      description:
        'Authenticates requests coming from Shopify checkout extensions.',
      type: 'AuthenticateCheckout',
    },
  ],
  defaultExample: {
    description: 'Authenticate and return offers for the shop',
    codeblock: {
      title: 'Authenticate and return offers for the shop',
      tabs: [
        {
          title: '/app/routes/**.ts',
          language: 'typescript',
          code: './authenticate.public.checkout.doc.example.ts',
        },
        {
          title: '/app/offers.server.ts',
          language: 'typescript',
          code: './authenticate.public.checkout.doc.example.offers.ts',
        },
      ],
    },
  },
  jsDocTypeExamples: ['CheckoutContext'],
  related: [
    {
      name: 'Session token API',
      subtitle:
        'Checkout UI extension API for interacting with session tokens.',
      url: '/docs/api/checkout-ui-extensions/latest/apis/session-token',
      type: 'shopify',
    },
  ],
};

export default data;
