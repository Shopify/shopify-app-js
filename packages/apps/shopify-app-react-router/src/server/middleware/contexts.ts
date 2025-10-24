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

// Future contexts will be added as we implement additional middleware:
// - checkoutContext, customerAccountContext, appProxyContext (Phase 4)
// - fulfillmentContext, posContext (Phase 4)
