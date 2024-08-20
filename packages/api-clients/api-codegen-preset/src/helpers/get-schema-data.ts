import type {CodegenConfig} from '@graphql-codegen/cli';

import {ApiType} from '../types';

import {apiConfigs} from './api-configs';

interface SchemaData {
  schema: CodegenConfig['schema'];
  schemaFile: string;
}

interface ValuesOptions {
  apiKey?: string;
  apiVersion?: string;
}

export function getSchemaData(
  outputDir: string,
  apiType: ApiType,
  values: ValuesOptions,
): SchemaData {
  switch (apiType) {
    case ApiType.Customer:
      if (!values.apiKey) {
        throw new Error('The customer API requires an API key');
      }

      return getCustomerApiSchema(outputDir, values);
    default:
      return getSchema(apiType, outputDir, values);
  }
}

function getSchema(
  apiType: ApiType,
  outputDir: string,
  values: ValuesOptions,
): SchemaData {
  const config = apiConfigs[apiType];

  let schema = config.schema;
  let schemaFile = config.schemaFile;
  if (values.apiVersion) {
    schema = schema.replace('%%API_VERSION%%', `/${values.apiVersion}`);
    schemaFile = schemaFile.replace('%%API_VERSION%%', `-${values.apiVersion}`);
  } else {
    schema = schema.replace('%%API_VERSION%%', '');
    schemaFile = schemaFile.replace('%%API_VERSION%%', '');
  }

  return {
    schema,
    schemaFile: `${outputDir}/${schemaFile}`,
  };
}

function getCustomerApiSchema(
  outputDir: string,
  values: ValuesOptions,
): SchemaData {
  const config = apiConfigs[ApiType.Customer];

  let schema = config.schema;
  let schemaFile = config.schemaFile;
  if (values.apiVersion) {
    schema = schema.replace('%%API_VERSION%%', values.apiVersion);
    schemaFile = schemaFile.replace('%%API_VERSION%%', `-${values.apiVersion}`);
  } else {
    schema = schema.replace('&api_version=%%API_VERSION%%', '');
    schemaFile = schemaFile.replace('%%API_VERSION%%', '');
  }

  if (values.apiKey) {
    schema = schema.replace('%%API_KEY%%', values.apiKey);
  }

  return {
    schema: [{[schema]: {method: 'GET', headers: {}}}],
    schemaFile: `${outputDir}/${schemaFile}`,
  };
}
