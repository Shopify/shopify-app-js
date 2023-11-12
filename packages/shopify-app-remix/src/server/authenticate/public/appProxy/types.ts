import {Session, ShopifyRestResources} from '@shopify/shopify-api';

import {AdminApiContext, StorefrontContext} from '../../../clients';

export type AuthenticateAppProxy = (
  request: Request,
) => Promise<AppProxyContext | AppProxyContextWithSession>;

interface Options {
  layout?: boolean;
}

export type LiquidResponseFunction = (
  body: string,
  initAndOptions?: number | (ResponseInit & Options),
) => Response;

interface Context {
  /**
   * A utility for creating a Liquid Response.
   *
   * @example
   * <caption>Rendering liquid content.</caption>
   * <description>Use the `liquid` helper to render a `Response` with Liquid content.</description>
   * ```ts
   * // app/routes/**\/.ts
   * import {authenticate} from "~/shopify.server"
   *
   * export async function loader({ request }) {
   *   const {liquid} = authenticate.public.appProxy(request);
   *
   *   return liquid("Hello {{shop.name}}")
   * }
   *
   * ```
   */
  liquid: LiquidResponseFunction;
}

export interface AppProxyContext extends Context {
  /**
   * No session is available for the shop that made this request.
   *
   * This comes from the session storage which `shopifyApp` uses to store sessions in your database of choice.
   */
  session: undefined;

  /**
   * No session is available for the shop that made this request.
   * Therefore no methods for interacting with the GraphQL / REST Admin APIs are available.
   */
  admin: undefined;

  /**
   * No session is available for the shop that made this request.
   * Therefore no method for interacting with the Storefront API is available.
   */
  storefront: undefined;
}

export interface AppProxyContextWithSession<
  Resources extends ShopifyRestResources = ShopifyRestResources,
> extends Context {
  /**
   * The session for the shop that made the request.
   *
   * This comes from the session storage which `shopifyApp` uses to store sessions in your database of choice.
   *
   * Use this to get shop or user-specific data.
   *
   * @example
   * <caption>Using the session object.</caption>
   * <description>Get your app's data using an offline session for the shop that made the request.</description>
   * ```ts
   * // app/routes/**\/.ts
   * import { json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import { getMyAppModelData } from "~/db/model.server";
   *
   * export const loader = async ({ request }) => {
   *   const { session } = await authenticate.public.appProxy(request);
   *   return json(await getMyAppModelData({shop: session.shop));
   * };
   * ```
   */
  session: Session;

  /**
   * Methods for interacting with the GraphQL / REST Admin APIs for the store that made the request.
   *
   * @example
   * <caption>Interacting with the Admin API.</caption>
   * <description>Use the `admin` object to interact with the REST or GraphQL APIs.</description>
   * ```ts
   * // app/routes/**\/.ts
   * import { json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export async function action({ request }: ActionFunctionArgs) {
   *   const { admin } = await authenticate.public.appProxy(request);
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
  admin: AdminApiContext<Resources>;

  /**
   * Method for interacting with the Shopify Storefront Graphql API for the store that made the request.
   *
   * @example
   * <caption>Interacting with the Storefront API.</caption>
   * <description>Use the `storefront` object to interact with the GraphQL API.</description>
   * ```ts
   * // app/routes/**\/.ts
   * import { json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export async function action({ request }: ActionFunctionArgs) {
   *   const { storefront } = await authenticate.public.appProxy(request);
   *
   *   const response = await storefront.graphql(`{blogs(first: 10) { edges { node { id } } } }`);
   *
   *   return json(await response.json());
   * }
   * ```
   */
  storefront: StorefrontContext;
}
