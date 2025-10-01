import {CustomerAccountOperations} from '@shopify/customer-account-api-client';

import {GraphQLClient} from '../types';

export interface CustomerAccountContext {
  /**
   * Method for interacting with the Shopify Customer Account GraphQL API
   *
   * {@link https://shopify.dev/docs/api/customer}
   *
   * @example
   * <caption>Querying the GraphQL API.</caption>
   * <description>Use `customerAccount.graphql` to make query / mutation requests.</description>
   * ```ts
   * // app/routes/**\/.ts
   * import { json } from "react-router";
   * import { authenticate } from "../shopify.server";
   *
   * export async function loader({ request }: LoaderFunctionArgs) {
   *   const { customerAccount } = await authenticate.customerAccount(request);
   *
   *   const response = await customerAccount.graphql(`
   *     query { 
   *       customer { 
   *         id 
   *         email 
   *         firstName 
   *         lastName 
   *       } 
   *     }
   *   `);
   *
   *   return (await response.json());
   * }
   * ```
   *
   * @example
   * <caption>Handling GraphQL errors.</caption>
   * <description>Catch `GraphqlQueryError` errors to see error messages from the API.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs } from "react-router";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { customerAccount } = await authenticate.customerAccount(request);
   *
   *   try {
   *     const response = await customerAccount.graphql(
   *       `#graphql
   *       query {
   *         customer {
   *           id
   *           not_a_field
   *         }
   *       }`,
   *     );
   *
   *     return ({ data: await response.json() });
   *   } catch (error) {
   *     if (error instanceof GraphqlQueryError) {
   *       return ({ errors: error.body?.errors }, { status: 500 });
   *     }
   *     return ({ message: "An error occurred" }, { status: 500 });
   *   }
   * }
   * ```
   */
  graphql: GraphQLClient<CustomerAccountOperations>;
}