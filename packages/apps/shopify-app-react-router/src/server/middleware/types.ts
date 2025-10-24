import {
  JwtPayload,
  Session,
  AppSubscription,
  UsageRecord,
  BillingCheckResponseObject,
} from '@shopify/shopify-api';

import type {AdminApiContext} from '../clients';
import type {AppConfigArg} from '../config-types';
import type {EnsureCORSFunction} from '../authenticate/helpers/ensure-cors-headers';
import type {RedirectFunction} from '../authenticate/admin/helpers/redirect';
import type {
  RequestBillingOptions,
  CancelBillingOptions,
  CreateUsageRecordOptions,
  UpdateUsageCappedAmountOptions,
  CheckBillingOptions,
} from '../authenticate/admin/billing/types';
// Note: React Router types (MiddlewareFunction, LoaderFunctionArgs, etc.) should be
// imported directly from 'react-router' by consumers. We only define Shopify-specific
// types here.

/**
 * Complete admin context that provides ALL Shopify APIs
 * This is created by withAuthentication middleware and matches authenticate.admin() return value
 *
 * Note: React Router apps are always embedded in Shopify Admin, so redirect and sessionToken
 * are always available (unless distribution is AppDistribution.ShopifyAdmin)
 */
export interface AdminContext<Config extends AppConfigArg = AppConfigArg> {
  /**
   * Admin API client (GraphQL)
   */
  api: AdminApiContext;

  /**
   * Billing API - all billing operations
   */
  billing: {
    /**
     * Check current billing status (non-blocking)
     */
    check: <Options extends CheckBillingOptions<Config>>(
      options?: Options,
    ) => Promise<BillingCheckResponseObject>;

    /**
     * Request payment for a plan (throws redirect)
     * WARNING: Should only be called in actions, not loaders
     */
    request: (options: RequestBillingOptions<Config>) => Promise<never>;

    /**
     * Cancel a subscription
     */
    cancel: (options: CancelBillingOptions) => Promise<AppSubscription>;

    /**
     * Create usage record for metered billing
     */
    createUsageRecord: (
      options: CreateUsageRecordOptions,
    ) => Promise<UsageRecord>;

    /**
     * Update usage capped amount (throws redirect)
     * WARNING: Should only be called in actions, not loaders
     */
    updateUsageCappedAmount: (
      options: UpdateUsageCappedAmountOptions,
    ) => Promise<never>;

    /**
     * @deprecated Use check() and request() instead
     */
    require?: never;
  };

  /**
   * The session for the user who made the request
   */
  session: Session;

  /**
   * The decoded and validated session token (always present for embedded apps)
   */
  sessionToken: JwtPayload;

  /**
   * Redirect helper with App Bridge support (always present for embedded apps)
   * WARNING: Should only be called in actions, not loaders
   */
  redirect: RedirectFunction;

  /**
   * CORS helper function
   */
  cors: EnsureCORSFunction;
}

/**
 * Extended admin context for embedded apps (includes redirect and sessionToken)
 * This is the same as AdminContext since React Router apps are always embedded
 * @deprecated Use AdminContext directly
 */
export type EmbeddedAdminContext<Config extends AppConfigArg = AppConfigArg> =
  AdminContext<Config>;

/**
 * Admin context for non-embedded apps (no sessionToken or redirect)
 * Only used for AppDistribution.ShopifyAdmin (rare case)
 */
export interface NonEmbeddedAdminContext<
  Config extends AppConfigArg = AppConfigArg,
> extends Omit<AdminContext<Config>, 'sessionToken' | 'redirect'> {
  sessionToken?: never;
  redirect?: never;
}

/**
 * Convenience type for accessing the admin context in routes
 * Provides proper type inference for your specific app config (billing plans, etc.)
 *
 * Since React Router apps are always embedded in Shopify Admin, redirect and sessionToken
 * are always available.
 *
 * @example
 * ```typescript
 * // shopify.server.ts
 * export type AppAdmin = GetAdminContext<typeof shopify>;
 *
 * // routes
 * const admin = context.get(adminContext) as AppAdmin;
 * admin.api.graphql(...);
 * admin.billing.request({ plan: MONTHLY_PLAN }); // Type-safe with your plans!
 * admin.redirect("/"); // Always available
 * admin.sessionToken; // Always available
 * ```
 */
export type GetAdminContext<App> = App extends {
  config: infer Config extends AppConfigArg;
}
  ? AdminContext<Config>
  : AdminContext;

/**
 * Options for authentication middleware
 */
export interface AuthMiddlewareOptions {
  /**
   * Strategy for authentication
   */
  strategy?: 'token-exchange' | 'merchant-custom';

  /**
   * Custom redirect path for unauthenticated requests
   */
  loginPath?: string;

  /**
   * Skip auth for specific paths
   */
  exclude?: string[] | RegExp[];

  /**
   * Custom error handler
   */
  onError?: (error: Error) => Response | Promise<Response>;
}

/**
 * Options for billing required middleware
 */
export interface BillingRequiredOptions<
  Config extends AppConfigArg = AppConfigArg,
> {
  /**
   * Required billing plans - must have at least one
   */
  plans: Config['billing'] extends object
    ? (keyof Config['billing'])[]
    : string[];

  /**
   * How to handle the request if the shop doesn't have an active payment for any plan.
   * Receives the admin context so you can call billing.request() or other operations.
   * This matches the behavior of billing.require() from the current pattern.
   *
   * @example
   * ```typescript
   * onFailure: async (admin) => {
   *   // Auto-request a specific plan
   *   return admin.billing.request({ plan: "premium" });
   * }
   * ```
   *
   * @example
   * ```typescript
   * onFailure: async (admin) => {
   *   // Custom logic based on shop
   *   if (admin.session.shop.includes("test")) {
   *     return redirect("/app/trial-info");
   *   }
   *   return admin.billing.request({ plan: "premium" });
   * }
   * ```
   */
  onFailure: (admin: AdminContext<Config>) => Promise<Response>;

  /**
   * Whether to use test mode for billing (prevents actual charges)
   * Overrides the global billing.test config
   */
  isTest?: boolean;
}

/**
 * Webhook context provided by withWebhook middleware
 * Matches the return value of authenticate.webhook()
 */
export interface WebhookContext<Topics extends string = string> {
  /** The webhook topic (e.g., "products/create") */
  topic: Topics;

  /** The shop domain that triggered the webhook */
  shop: string;

  /** The parsed webhook payload */
  payload: Record<string, any>;

  /** Unique identifier for this webhook delivery */
  webhookId: string;

  /** API version used for the webhook */
  apiVersion: string;

  /** Optional sub-topic for certain webhooks */
  subTopic?: string;

  /**
   * Session for the shop (undefined if app is uninstalled)
   * Webhook requests can trigger after an app is uninstalled.
   * Always check if session exists before using it.
   */
  session?: Session;

  /**
   * Admin API client (only available when session exists)
   * Use this to make API calls in response to webhooks.
   */
  admin?: AdminApiContext;
}

/**
 * Flow context provided by withFlow middleware
 * Matches the return value of authenticate.flow()
 */
export interface FlowContext {
  /**
   * Session for the shop (always present - Flow requires a session)
   */
  session: Session;

  /**
   * The parsed Flow request payload
   */
  payload: any;

  /**
   * Admin API client (always available since session is required)
   */
  admin: AdminApiContext;
}

// Future: Additional middleware types will be added as we implement them
// - ScopesRequiredOptions for scope enforcement middleware
// - Public extension middleware (checkout, app proxy, customer account, POS)
// - Fulfillment middleware
// - CORS utilities
