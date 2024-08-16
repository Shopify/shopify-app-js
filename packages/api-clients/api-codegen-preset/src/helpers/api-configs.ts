import type {ApiType} from '../types';

interface ApiConfig {
  schema: string;
  schemaFile: string;
  typesFile: string;
  queryTypesFile: string;
  interfaceExtension: string;
  module: string;
  presetConfigs: {
    importTypes: {
      namespace: string;
    };
  };
}

type ApiConfigs = {
  [key in ApiType]: ApiConfig;
};

export const apiConfigs: ApiConfigs = {
  Admin: {
    schema: 'https://shopify.dev/admin-graphql-direct-proxy%%API_VERSION%%',
    schemaFile: 'admin%%API_VERSION%%.schema.json',
    typesFile: 'admin.types',
    queryTypesFile: 'admin.generated',
    interfaceExtension: `declare module '%%MODULE%%' {\n  type InputMaybe<T> = AdminTypes.InputMaybe<T>;\n  interface AdminQueries extends %%QUERY%% {}\n  interface AdminMutations extends %%MUTATION%% {}\n}`,
    module: '@shopify/admin-api-client',
    presetConfigs: {
      importTypes: {
        namespace: 'AdminTypes',
      },
    },
  },
  Storefront: {
    schema:
      'https://shopify.dev/storefront-graphql-direct-proxy%%API_VERSION%%',
    schemaFile: 'storefront%%API_VERSION%%.schema.json',
    typesFile: 'storefront.types',
    queryTypesFile: 'storefront.generated',
    interfaceExtension: `declare module '%%MODULE%%' {\n  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;\n  interface StorefrontQueries extends %%QUERY%% {}\n  interface StorefrontMutations extends %%MUTATION%% {}\n}`,
    module: '@shopify/storefront-api-client',
    presetConfigs: {
      importTypes: {
        namespace: 'StorefrontTypes',
      },
    },
  },
  Customer: {
    schema:
      'https://app.myshopify.com/services/graphql/introspection/customer?api_client_api_key=%%API_KEY%%&api_version=%%API_VERSION%%',
    schemaFile: 'customer%%API_VERSION%%.schema.json',
    typesFile: 'customer.types',
    queryTypesFile: 'customer.generated',
    interfaceExtension: `declare module '%%MODULE%%' {\n  type InputMaybe<T> = CustomerTypes.InputMaybe<T>;\n  interface CustomerQueries extends %%QUERY%% {}\n  interface CustomerMutations extends %%MUTATION%% {}\n}`,
    module: '@shopify/customer-api-client',
    presetConfigs: {
      importTypes: {
        namespace: 'CustomerTypes',
      },
    },
  },
};
