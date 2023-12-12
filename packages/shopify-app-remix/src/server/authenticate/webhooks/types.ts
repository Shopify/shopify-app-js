import {Session, Shopify, ShopifyRestResources} from '@shopify/shopify-api';

import type {JSONValue} from '../../types';
import type {AdminApiContext} from '../../clients';
import type {FeatureEnabled, FutureFlagOptions} from '../../future/flags';

export interface RegisterWebhooksOptions {
  /**
   * The Shopify session used to register webhooks using the Admin API.
   */
  session: Session;
}

interface Context<Topics = string | number | symbol> {
  /**
   * The API version used for the webhook.
   *
   * @example
   * <caption>Webhook API version.</caption>
   * <description>Get the API version used for webhook request.</description>
   * ```ts
   * // /app/routes/webhooks.tsx
   * import { ActionFunction } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const action: ActionFunction = async ({ request }) => {
   *   const { apiVersion } = await authenticate.webhook(request);
   *   return new Response();
   * };
   * ```
   */
  apiVersion: string;
  /**
   * The shop where the webhook was triggered.
   *
   * @example
   * <caption>Webhook shop.</caption>
   * <description>Get the shop that triggered a webhook.</description>
   * ```ts
   * // /app/routes/webhooks.tsx
   * import { ActionFunction } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const action: ActionFunction = async ({ request }) => {
   *   const { shop } = await authenticate.webhook(request);
   *   return new Response();
   * };
   * ```
   */
  shop: string;
  /**
   * The topic of the webhook.
   *
   * @example
   * <caption>Webhook topic.</caption>
   * <description>Get the event topic for the webhook.</description>
   * ```ts
   * // /app/routes/webhooks.tsx
   * import { ActionFunction } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const action: ActionFunction = async ({ request }) => {
   *   const { topic } = await authenticate.webhook(request);
   *
   *   switch (topic) {
   *     case "APP_UNINSTALLED":
   *       // Do something when the app is uninstalled.
   *       break;
   *   }
   *
   *   return new Response();
   * };
   * ```
   */
  topic: Topics;
  /**
   * A unique ID for the webhook. Useful to keep track of which events your app has already processed.
   *
   * @example
   * <caption>Webhook ID.</caption>
   * <description>Get the webhook ID.</description>
   * ```ts
   * // /app/routes/webhooks.tsx
   * import { ActionFunction } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const action: ActionFunction = async ({ request }) => {
   *   const { webhookId } = await authenticate.webhook(request);
   *   return new Response();
   * };
   * ```
   */
  webhookId: string;
  /**
   * The payload from the webhook request.
   *
   * @example
   * <caption>Webhook payload.</caption>
   * <description>Get the request's POST payload.</description>
   * ```ts
   * // /app/routes/webhooks.tsx
   * import { ActionFunction } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const action: ActionFunction = async ({ request }) => {
   *   const { payload } = await authenticate.webhook(request);
   *   return new Response();
   * };
   * ```
   */
  payload: JSONValue;
}

export interface WebhookContextWithoutSession<Topics = string | number | symbol>
  extends Context<Topics> {
  session: undefined;
  admin: undefined;
}

export interface LegacyWebhookAdminApiContext<
  Resources extends ShopifyRestResources,
> {
  /** A REST client. */
  rest: InstanceType<Shopify['clients']['Rest']> & Resources;
  /** A GraphQL client. */
  graphql: InstanceType<Shopify['clients']['Graphql']>;
}

export type WebhookAdminContext<
  Future extends FutureFlagOptions,
  Resources extends ShopifyRestResources,
> = FeatureEnabled<Future, 'v3_webhookAdminContext'> extends true
  ? AdminApiContext<Resources>
  : LegacyWebhookAdminApiContext<Resources>;

export interface WebhookContextWithSession<
  Future extends FutureFlagOptions,
  Resources extends ShopifyRestResources,
  Topics = string | number | symbol,
> extends Context<Topics> {
  /**
   * A session with an offline token for the shop.
   *
   * Returned only if there is a session for the shop.
   */
  session: Session;

  /**
   * An admin context for the webhook.
   *
   * Returned only if there is a session for the shop.
   *
   * @example
   * <caption>[V3] Webhook admin context.</caption>
   * <description>With the `v3_webhookAdminContext` future flag enabled, use the `admin` object in the context to interact with the Admin API.</description>
   * ```ts
   * // /app/routes/webhooks.tsx
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export async function action({ request }: ActionFunctionArgs) {
   *   const { admin } = await authenticate.webhook(request);
   *
   *   const response = await admin?.graphql(
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
   *
   * @example
   * <caption>Webhook admin context.</caption>
   * <description>Use the `admin` object in the context to interact with the Admin API. This format will be removed in V3 of the package.</description>
   * ```ts
   * // /app/routes/webhooks.tsx
   * import { json, ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export async function action({ request }: ActionFunctionArgs) {
   *   const { admin } = await authenticate.webhook(request);
   *
   *   const response = await admin?.graphql.query<any>({
   *     data: {
   *       query: `#graphql
   *         mutation populateProduct($input: ProductInput!) {
   *           productCreate(input: $input) {
   *             product {
   *               id
   *             }
   *           }
   *         }`,
   *       variables: { input: { title: "Product Name" } },
   *     },
   *   });
   *
   *   const productData = response?.body.data;
   *   return json({ data: productData.data });
   * }
   * ```
   */
  admin: WebhookAdminContext<Future, Resources>;
}

export type WebhookContext<
  Future extends FutureFlagOptions,
  Resources extends ShopifyRestResources,
  Topics = string | number | symbol,
> =
  | WebhookContextWithoutSession<Topics>
  | WebhookContextWithSession<Future, Resources, Topics>;

export type AuthenticateWebhook<
  Future extends FutureFlagOptions,
  Resources extends ShopifyRestResources,
  Topics = string | number | symbol,
> = (request: Request) => Promise<WebhookContext<Future, Resources, Topics>>;
