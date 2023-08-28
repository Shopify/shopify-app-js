import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Authenticate public',
  description:
    'Contains functions for authenticating checkout extension requests.',
  category: 'backend',
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
