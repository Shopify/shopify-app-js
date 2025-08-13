import fs from 'fs';

import {pluckConfig} from '@shopify/graphql-codegen';
import type {IGraphQLProject, SchemaPointer} from 'graphql-config';

import {type ShopifyApiProjectOptions} from './types';
import {shopifyApiTypes} from './api-types';
import {getSchemaData} from './helpers/get-schema-data';

export const shopifyApiProject = ({
  apiType,
  apiVersion,
  module,
  outputDir = '.',
  documents = ['**/*.{ts,tsx}', '!node_modules'],
  declarations = true,
  apiKey,
  enumsAsConst,
}: ShopifyApiProjectOptions): IGraphQLProject => {
  const {schema, schemaFile} = getSchemaData(outputDir, apiType, {
    apiVersion,
    apiKey,
  });

  const schemaFileExists = fs.existsSync(`${schemaFile}`);

  return {
    schema: schemaFileExists ? schemaFile : (schema as SchemaPointer),
    documents,
    extensions: {
      codegen: {
        pluckConfig,
        generates: shopifyApiTypes({
          apiType,
          apiVersion,
          apiKey,
          outputDir,
          documents,
          module,
          declarations,
          enumsAsConst,
        }),
      },
    },
  };
};
