import {GraphQLClient} from '../types';

export interface StorefrontContext {
  /**
   * Method for interacting with the Shopify Storefront GraphQL API
   *
   * If you're getting incorrect type hints in the Shopify template, follow [these instructions](https://github.com/Shopify/shopify-app-template-remix/tree/main#incorrect-graphql-hints).
   *
   * {@link https://shopify.dev/docs/api/storefront}
   *
   * @example
   * <caption>Querying the GraphQL API.</caption>
   * <description>Use `storefront.graphql` to make query / mutation requests.</description>
   * ```ts
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export async function action({ request }: ActionFunctionArgs) {
   *   const { storefront } = await authenticate.storefront(request);
   *
   *   const response = await storefront.graphql(`{blogs(first: 10) { edges { node { id } } } }`);
   *
   *   const productData = await response.json();
   *   return json({ data: productData.data });
   * }
   * ```
   */
  graphql: GraphQLClient;
}
