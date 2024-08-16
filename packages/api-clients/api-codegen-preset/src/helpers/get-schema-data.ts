import {ApiType} from '../types';

import {apiConfigs} from './api-configs';

export function getSchemaData(
  outputDir: string,
  apiType: ApiType,
  apiVersion?: string,
  apiKey?: string,
) {
  const config = apiConfigs[apiType];

  if (apiType === ApiType.Customer) {
    if (!apiKey) {
      throw new Error('The customer API requires an API key');
    }

    const schemaUrl = (() => {
      const schemaWithApiKey = config.schema.replace('%%API_KEY%%', apiKey);

      if (apiVersion) {
        return schemaWithApiKey.replace('%%API_VERSION%%', apiVersion);
      }

      return schemaWithApiKey.replace('&api_version=%%API_VERSION%%', '');
    })();

    const schema = [
      {
        [schemaUrl]: {
          method: 'GET',
        },
      },
    ];

    const schemaFile = `${outputDir}/${config.schemaFile.replace(
      '%%API_VERSION%%',
      apiVersion ? `-${apiVersion}` : '',
    )}`;

    return {schema, schemaFile};
  }

  return {
    schema: config.schema.replace(
      '%%API_VERSION%%',
      apiVersion ? `/${apiVersion}` : '',
    ),
    schemaFile: `${outputDir}/${config.schemaFile.replace(
      '%%API_VERSION%%',
      apiVersion ? `-${apiVersion}` : '',
    )}`,
  };
}
