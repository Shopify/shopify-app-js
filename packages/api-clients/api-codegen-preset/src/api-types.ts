import fs from 'fs';

import {preset} from './preset';
import type {ShopifyApiTypesOptions} from './types';
import {getSchemaData} from './helpers/get-schema-data';
import {getOutputFiles} from './helpers/get-output-files';

export const shopifyApiTypes = ({
  apiType,
  apiVersion,
  module,
  outputDir = '.',
  documents = ['**/*.{ts,tsx}', '!**/node_modules'],
  declarations = true,
}: ShopifyApiTypesOptions) => {
  const {schema, schemaFile} = getSchemaData(outputDir, apiType, apiVersion);
  const {typesFile, queryTypesFile} = getOutputFiles(apiType, declarations);

  const schemaFileExists = fs.existsSync(`${schemaFile}`);

  return {
    ...(schemaFileExists
      ? {}
      : {
          [schemaFile]: {
            schema,
            plugins: ['introspection'],
            config: {minify: true},
          },
        }),
    [`${outputDir}/${typesFile}`]: {
      schema: schemaFileExists ? schemaFile : schema,
      plugins: ['typescript'],
    },
    [`${outputDir}/${queryTypesFile}`]: {
      schema: schemaFileExists ? schemaFile : schema,
      preset,
      documents,
      presetConfig: {apiType, module},
    },
  };
};
