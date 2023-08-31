import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Public',
  description:
    'Contains functions for authenticating checkout extension requests.' +
    "\n\n> Caution: Since these are public requests, make sure you're not exposing any sensitive merchant data in your responses.",
  category: 'backend',
  subCategory: 'Authenticate',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'authenticate.public',
      description: 'Authenticates requests coming from Checkout extensions.',
      type: 'AuthenticatePublic',
    },
    {
      title: 'PublicContext',
      description: 'Object returned by `authenticate.public`.',
      type: 'PublicContext',
      jsDocExamples: true,
    },
  ],
  related: [],
};

export default data;
