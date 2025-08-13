import {AdminOperations} from '@shopify/admin-api-client';
import {Session} from '@shopify/shopify-api';

import {BasicParams} from '../../types';
import {GraphQLClient} from '../types';

export interface AdminClientOptions {
  params: BasicParams;
  session: Session;
  handleClientError?: HandleAdminClientError;
}

export type HandleAdminClientError = (arg: {
  error: any;
  params: BasicParams;
  session: Session;
}) => Promise<void>;

export interface AdminApiContext {
  /**
   * Methods for interacting with the Shopify Admin GraphQL API
   *
   * {@link https://shopify.dev/docs/api/admin-graphql}
   * {@link https://github.com/Shopify/shopify-app-js/blob/main/packages/apps/shopify-api/docs/reference/clients/Graphql.md}
   *
   * @example
   * <caption>Querying the GraphQL API.</caption>
   * <description>Use `admin.graphql` to make query / mutation requests.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { ActionFunctionArgs } from "react-router";
   * import { authenticate } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { admin } = await authenticate.admin(request);
   *
   *   const response = await admin.graphql(
   *     `#graphql
   *     mutation populateProduct($input: ProductInput!) {
   *       productCreate(input: $input) {
   *         product {
   *           id
   *         }
   *       }
   *     }`,
   *     {
   *       variables: {
   *         input: { title: "Product Name" },
   *       },
   *     },
   *   );
   *
   *   const productData = await response.json();
   *   return ({
   *     productId: productData.data?.productCreate?.product?.id,
   *   });
   * }
   * ```
   *
   * ```ts
   * // /app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-react-router/server";
   *
   * const shopify = shopifyApp({
   *   // ...
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   *
   * @example
   * <caption>Handling GraphQL errors.</caption>
   * <description>Catch `GraphqlQueryError` errors to see error messages from the API.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { ActionFunctionArgs } from "react-router";
   * import { authenticate } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { admin } = await authenticate.admin(request);
   *
   *   try {
   *     const response = await admin.graphql(
   *       `#graphql
   *       query incorrectQuery {
   *         products(first: 10) {
   *           nodes {
   *             not_a_field
   *           }
   *         }
   *       }`,
   *     );
   *
   *     return ({ data: await response.json() });
   *   } catch (error) {
   *     if (error instanceof GraphqlQueryError) {
   *       // error.body.errors:
   *       // { graphQLErrors: [
   *       //   { message: "Field 'not_a_field' doesn't exist on type 'Product'" }
   *       // ] }
   *       return ({ errors: error.body?.errors }, { status: 500 });
   *     }
   *     return ({ message: "An error occurred" }, { status: 500 });
   *   }
   * }
   * ```
   *
   * ```ts
   * // /app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-react-router/server";
   *
   * const shopify = shopifyApp({
   *   // ...
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  graphql: GraphQLClient<AdminOperations>;
}
