import {
  AdminOperations,
  Session,
  ShopifyRestResources,
} from '@shopify/shopify-api';

import {BasicParams} from '../../types';
import type {GraphQLClient} from '../types';

import type {RestClientWithResources} from './rest';

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

export interface AdminApiContext<
  Resources extends ShopifyRestResources = ShopifyRestResources,
> {
  /**
   * Methods for interacting with the Shopify Admin REST API
   *
   * There are methods for interacting with individual REST resources. You can also make `GET`, `POST`, `PUT` and `DELETE` requests should the REST resources not meet your needs.
   *
   * {@link https://shopify.dev/docs/api/admin-rest}
   *
   * @example
   * <caption>Using REST resources.</caption>
   * <description>Getting the number of orders in a store using REST resources.</description>
   *
   * ```ts
   * // /app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   * import { restResources } from "@shopify/shopify-api/rest/admin/2023-07";
   *
   * const shopify = shopifyApp({
   *   restResources,
   *   // ...etc
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   *
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { admin, session } = await authenticate.admin(request);
   *   return json(admin.rest.resources.Order.count({ session }));
   * };
   * ```
   *
   * @example
   * <caption>Performing a GET request to the REST API.</caption>
   * <description>Use `admin.rest.<method>` to make custom requests to the API.</description>
   *
   * ```ts
   * // /app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   * import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
   *
   * const shopify = shopifyApp({
   *   restResources,
   *   // ...etc
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   *
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { admin, session } = await authenticate.admin(request);
   *   const response = await admin.rest.get({ path: "/customers/count.json" });
   *   const customers = await response.json();
   *   return json({ customers });
   * };
   * ```
   */
  rest: RestClientWithResources<Resources>;

  /**
   * Methods for interacting with the Shopify Admin GraphQL API
   *
   * {@link https://shopify.dev/docs/api/admin-graphql}
   * {@link https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/docs/reference/clients/Graphql.md}
   *
   * @example
   * <caption>Querying the GraphQL API.</caption>
   * <description>Use `admin.graphql` to make query / mutation requests.</description>
   * ```ts
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export async function action({ request }: ActionFunctionArgs) {
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
   *     { variables: { input: { title: "Product Name" } } }
   *   );
   *
   *   const productData = await response.json();
   *   return json({ data: productData.data });
   * }
   * ```
   */
  graphql: <T extends keyof AdminOperations | string>(
    ...params: Parameters<GraphQLClient<T, AdminOperations>>
  ) => ReturnType<GraphQLClient<T, AdminOperations>>;
}
