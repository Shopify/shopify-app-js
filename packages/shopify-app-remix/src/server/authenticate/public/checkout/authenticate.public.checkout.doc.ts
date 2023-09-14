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
    {
      title: 'CheckoutContext',
      description: 'Object returned by `authenticate.public.checkout`.',
      type: 'CheckoutContext',
      jsDocExamples: true,
    },
  ],
  related: [],
};

export default data;
