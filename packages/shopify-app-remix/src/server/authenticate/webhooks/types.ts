import {Session, Shopify, ShopifyRestResources} from '@shopify/shopify-api';

import type {JSONValue} from '../../types';

export interface RegisterWebhooksOptions {
  /**
   * The Shopify session used to register webhooks via the Admin API.
   */
  session: Session;
}

interface Context<Topics = string | number | symbol> {
  /** The API version used for the webhook. */
  apiVersion: string;
  /** The shop where the webhook was triggered. */
  shop: string;
  /** The topic of the webhook. */
  topic: Topics;
  /** The webhook ID. */
  webhookId: string;
  /** The payload from the webhook request. */
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
   * Only returned if there is a session for the shop.
   */
  session: Session;
  /**
   * An admin context for the webhook.
   *
   * Only returned if there is a session for the shop.
   */
  admin: {
    /** A REST client. */
    rest: InstanceType<Shopify['clients']['Rest']> & Resources;
    /** A GraphQL client. */
    graphql: InstanceType<Shopify['clients']['Graphql']>;
  };
}
