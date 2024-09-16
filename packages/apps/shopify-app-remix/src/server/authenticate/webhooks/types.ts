import {Session, ShopifyRestResources} from '@shopify/shopify-api';

import type {AdminApiContext} from '../../clients';

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
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
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
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
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
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
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
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
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
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { payload } = await authenticate.webhook(request);
   *   return new Response();
   * };
   * ```
   */
  payload: Record<string, any>;

  /**
   * The sub-topic of the webhook. This is only available for certain webhooks.
   *
   * @example
   * <caption>Webhook sub-topic.</caption>
   * <description>Get the webhook sub-topic.</description>
   * ```ts
   * // /app/routes/webhooks.tsx
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { subTopic } = await authenticate.webhook(request);
   *   return new Response();
   * };
   * ```
   *
   */
  subTopic?: string;
}

export interface WebhookContextWithoutSession<Topics = string | number | symbol>
  extends Context<Topics> {
  session: undefined;
  admin: undefined;
}

export interface WebhookContextWithSession<
  Resources extends ShopifyRestResources,
  Topics = string | number | symbol,
> extends Context<Topics> {
  /**
   * A session with an offline token for the shop.
   *
   * Returned only if there is a session for the shop.
   * Webhook requests can trigger after an app is uninstalled
   * If the app is already uninstalled, the session may be undefined.
   * Therefore, you should check for the session before using it.
   *
   * @example
   * <caption>Protecting against uninstalled apps.</caption>
   * ```ts
   * // /app/routes/webhooks.tsx
   * import type { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "~/shopify.server";

   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { session } = await authenticate.webhook(request);
   *   
   *   // Webhook requests can trigger after an app is uninstalled
   *   // If the app is already uninstalled, the session may be undefined.
   *   if (!session) {
   *     throw new Response();
   *   }
   *
   *   // Handle webhook request
   *   console.log("Received webhook webhook");
   *
   *   return new Response();
   * };
   * ```
   */
  session: Session;

  /**
   * An admin context for the webhook.
   *
   * Returned only if there is a session for the shop.
   *
   * @example
   * <caption>Webhook admin context.</caption>
   * <description>Use the `admin` object in the context to interact with the Admin API.</description>
   * ```ts
   * // /app/routes/webhooks.tsx
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export async function action({ request }: ActionFunctionArgs) {
   *   const { admin } = await authenticate.webhook(request);
   *
   *   // Webhook requests can trigger after an app is uninstalled
   *   // If the app is already uninstalled, the session may be undefined.
   *   if (!session) {
   *     throw new Response();
   *   }
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
   */
  admin: AdminApiContext<Resources>;
}

export type WebhookContext<
  Resources extends ShopifyRestResources,
  Topics = string | number | symbol,
> =
  | WebhookContextWithoutSession<Topics>
  | WebhookContextWithSession<Resources, Topics>;

export type AuthenticateWebhook<
  Resources extends ShopifyRestResources,
  Topics = string | number | symbol,
> = (request: Request) => Promise<WebhookContext<Resources, Topics>>;
