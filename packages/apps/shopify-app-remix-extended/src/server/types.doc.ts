import {ReferenceEntityTemplateSchema} from '@shopify/generate-docs';

const data: ReferenceEntityTemplateSchema = {
  name: 'Types',
  description: 'Custom types for the Shopify app',
  category: 'Utilities',
  type: 'object',
  isVisualComponent: false,
  definitions: [
    {
      title: 'LizCat',
      description: 'Represents a cat with name and age properties',
      type: 'LizCat',
    },
    {
      title: 'createCat',
      description: 'Creates a new LizCat with the specified name and age 0',
      type: 'CreateCatGeneratedType',
    },
  ],
  jsDocTypeExamples: ['LizCat', 'CreateCatGeneratedType'],
  related: [],
};

export default data;
