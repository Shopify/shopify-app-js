import {Session, Shopify, ShopifyRestResources} from '@shopify/shopify-api';

import type {JSONValue} from '../../types';

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
   * <caption>Get API version used for webhook request.</caption>
   * ```
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
   * <caption>Get the shop that triggered a webhook.</caption>
   * ```
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
   * <caption>Get the webhook topic.</caption>
   * ```
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
   * <caption>Get the webhook ID.</caption>
   * ```
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
   * <caption>Get the request's POST payload.</caption>
   * ```
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

export interface WebhookContext<Topics = string | number | symbol>
  extends Context<Topics> {
  session: undefined;
  admin: undefined;
}

export interface WebhookContextWithSession<
  Topics = string | number | symbol,
  Resources extends ShopifyRestResources = any,
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
   */
  admin: {
    /** A REST client. */
    rest: InstanceType<Shopify['clients']['Rest']> & Resources;
    /** A GraphQL client. */
    graphql: InstanceType<Shopify['clients']['Graphql']>;
  };
}
