import {GraphQLClient} from '../types';

export interface StorefrontContext {
  /**
   * Method for interacting with the Shopify Storefront GraphQL API
   *
   * {@link https://shopify.dev/docs/api/storefront}
   *
   * @example
   * Getting a list of blog posts a new product
   * ```ts
   * import { ActionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export async function action({ request }: ActionArgs) {
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
  graphql: GraphQLClient;
}
