import {createContext} from 'react-router';
import {Session, JwtPayload} from '@shopify/shopify-api';

import type {AdminContext} from './types';

/**
 * Context for complete admin API access with all operations.
 * Set by withAuthentication middleware.
 * Includes GraphQL, billing, scopes, and other admin operations.
 */
export const adminContext = createContext<AdminContext>();

/**
 * Context for session object.
 * Set by withAuthentication middleware.
 * Contains shop and user-specific session data.
 */
export const sessionContext = createContext<Session>();

/**
 * Context for JWT payload (embedded apps only).
 * Set by withAuthentication middleware for embedded apps.
 * Contains the decoded session token.
 */
export const sessionTokenContext = createContext<JwtPayload>();

/**
 * Context for webhook data.
 * Set by withWebhook middleware.
 * Contains webhook topic, payload, shop, and optional session/admin API.
 */
export const webhookContext = createContext<import('./types').WebhookContext>();

/**
 * Context for Flow extension data.
 * Set by withFlow middleware.
 * Contains Flow payload, session, and admin API (all required).
 */
export const flowContext = createContext<import('./types').FlowContext>();

/**
 * Context for checkout extension data.
 * Set by withCheckout middleware.
 * Contains session token and CORS helper.
 */
export const checkoutContext = createContext<import('./types').CheckoutContext>();

/**
 * Context for app proxy data.
 * Set by withAppProxy middleware.
 * Contains liquid response helper, and optional session/admin/storefront APIs.
 */
export const appProxyContext = createContext<import('./types').AppProxyContext>();

/**
 * Context for customer account extension data.
 * Set by withCustomerAccount middleware.
 * Contains session token and CORS helper.
 */
export const customerAccountContext = createContext<
  import('./types').CustomerAccountContext
>();

/**
 * Context for fulfillment service data.
 * Set by withFulfillmentService middleware.
 * Contains session, payload (with kind), and admin API (all required).
 */
export const fulfillmentServiceContext = createContext<
  import('./types').FulfillmentServiceContext
>();

/**
 * Context for POS UI extension data.
 * Set by withPOS middleware.
 * Contains session token and CORS helper.
 */
export const posContext = createContext<import('./types').POSContext>();
