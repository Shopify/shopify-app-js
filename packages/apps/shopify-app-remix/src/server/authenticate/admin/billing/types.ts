import {
  AppSubscription,
  BillingCheckParams,
  BillingCheckResponseObject,
  BillingRequestParams,
  UsageRecord,
} from '@shopify/shopify-api';

import {ApiFutureFlags} from '../../../future/flags';
import type {AppConfigArg} from '../../../config-types';

export interface RequireBillingOptions<Config extends AppConfigArg>
  extends Omit<BillingCheckParams, 'session' | 'plans' | 'returnObject'> {
  /**
   * The plans to check for. Must be one of the values defined in the `billing` config option.
   */
  plans: (keyof Config['billing'])[];
  /**
   * How to handle the request if the shop doesn't have an active payment for any plan.
   */
  onFailure: (error: any) => Promise<Response>;
}

export interface CheckBillingOptions<Config extends AppConfigArg>
  extends Omit<BillingCheckParams, 'session' | 'plans' | 'returnObject'> {
  /**
   * The plans to check for. Must be one of the values defined in the `billing` config option.
   */
  plans?: (keyof Config['billing'])[];
}

export interface RequestBillingOptions<Config extends AppConfigArg>
  extends Omit<
    BillingRequestParams<ApiFutureFlags<Config['future']>>,
    'session' | 'plan' | 'returnObject'
  > {
  /**
   * The plan to request. Must be one of the values defined in the `billing` config option.
   */
  plan: keyof Config['billing'];
  /**
   * Whether to use the test mode. This prevents the credit card from being charged. Test shops and demo shops cannot be charged.
   */
  isTest?: boolean;
  /**
   * The URL to return to after the merchant approves the payment.
   */
  returnUrl?: string;
}

export interface CancelBillingOptions {
  /**
   * The ID of the subscription to cancel.
   */
  subscriptionId: string;
  /**
   * Whether to issue prorated credits for the unused portion of the app subscription. There will be a corresponding
   * deduction (based on revenue share) to your Partner account. For example, if a $10.00 app subscription
   * (with 0% revenue share) is cancelled and prorated half way through the billing cycle, then the merchant will be
   * credited $5.00 and that amount will be deducted from your Partner account.
   */
  prorate?: boolean;
  /**
   * Whether to use the test mode. This prevents the credit card from being charged.
   */
  isTest?: boolean;
}

export interface CreateUsageRecordOptions {
  /**
   * The description of the app usage record.
   */
  description: string;
  /**
   * The price of the app usage record.
   */
  price: {
    /**
     * The amount to charge for this usage record.
     */
    amount: number;
    /**
     * The currency code for this usage record.
     */
    currencyCode: string;
  };
  /**
   * Whether to use the test mode. This prevents the credit card from being charged.
   */
  isTest: boolean;
  /*
   * Defines the usage pricing plan the merchant is subscribed to.
   */
  subscriptionLineItemId?: string;
  /*
   * A unique key generated to avoid duplicate charges.
   */
  idempotencyKey?: string;
}

export interface BillingContext<Config extends AppConfigArg> {
  /**
   * Checks if the shop has an active payment for any plan defined in the `billing` config option.
   *
   * @returns A promise that resolves to an object containing the active purchases for the shop.
   *
   * @example
   * <caption>Requesting billing right away.</caption>
   * <description>Call `billing.request` in the `onFailure` callback to immediately redirect to the Shopify page to request payment.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs } from "@remix-run/node";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   await billing.require({
   *     plans: [MONTHLY_PLAN],
   *     isTest: true,
   *     onFailure: async () => billing.request({ plan: MONTHLY_PLAN }),
   *   });
   *
   *   // App logic
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-remix/server";
   *
   * export const MONTHLY_PLAN = 'Monthly subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [MONTHLY_PLAN]: {
   *       lineItems: [
   *         amount: 5,
   *         currencyCode: 'USD',
   *         interval: BillingInterval.Every30Days,
   *       ],
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   *
   * @example
   * <caption>Redirect to a plan selection page.</caption>
   * <description>When the app has multiple plans, create a page in your App that allows the merchant to select a plan. If a merchant does not have the required plan you can redirect them to page in your app to select one.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs, redirect } from "@remix-run/node";
   * import { authenticate, MONTHLY_PLAN, ANNUAL_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   const billingCheck = await billing.require({
   *     plans: [MONTHLY_PLAN, ANNUAL_PLAN],
   *     isTest: true,
   *     onFailure: () => redirect('/select-plan'),
   *   });
   *
   *   const subscription = billingCheck.appSubscriptions[0];
   *   console.log(`Shop is on ${subscription.name} (id ${subscription.id})`);
   *
   *   // App logic
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-remix/server";
   *
   * export const MONTHLY_PLAN = 'Monthly subscription';
   * export const ANNUAL_PLAN = 'Annual subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [MONTHLY_PLAN]: {
   *       lineItems: [
   *         amount: 5,
   *         currencyCode: 'USD',
   *         interval: BillingInterval.Every30Days,
   *       ],
   *     },
   *     [ANNUAL_PLAN]: {
   *       lineItems: [
   *         amount: 50,
   *         currencyCode: 'USD',
   *         interval: BillingInterval.Annual,
   *       ],
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  require: (
    options: RequireBillingOptions<Config>,
  ) => Promise<BillingCheckResponseObject>;

  /**
   * Checks if the shop has an active payment for any plan defined in the `billing` config option.
   *
   * @returns A promise that resolves to an object containing the active purchases for the shop.
   *
   * @example
   * <caption>Check what billing plans a merchant is subscribed to.</caption>
   * <description>Use billing.check if you want to determine which plans are in use. Unlike `require`, `check` does not
   * throw an error if no active billing plans are present. </description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs } from "@remix-run/node";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   const { hasActivePayment, appSubscriptions } = await billing.check({
   *     plans: [MONTHLY_PLAN],
   *     isTest: false,
   *   });
   *   console.log(hasActivePayment);
   *   console.log(appSubscriptions);
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-remix/server";
   *
   * export const MONTHLY_PLAN = 'Monthly subscription';
   * export const ANNUAL_PLAN = 'Annual subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [MONTHLY_PLAN]: {
   *       lineItems: [
   *         amount: 5,
   *         currencyCode: 'USD',
   *         interval: BillingInterval.Every30Days,
   *       ],
   *     },
   *     [ANNUAL_PLAN]: {
   *       lineItems: [
   *         amount: 50,
   *         currencyCode: 'USD',
   *         interval: BillingInterval.Annual,
   *       ],
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   *
   * @example
   * <caption>Check for payments without filtering.</caption>
   * <description>Use billing.check to see if any payments exist for the store, regardless of whether it's a test or
   * matches one or more plans.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs } from "@remix-run/node";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   const { hasActivePayment, appSubscriptions } = await billing.check();
   *   // This will be true if any payment is found
   *   console.log(hasActivePayment);
   *   console.log(appSubscriptions);
   * };
   * ```
   */
  check: <Options extends CheckBillingOptions<Config>>(
    options?: Options,
  ) => Promise<BillingCheckResponseObject>;

  /**
   * Requests payment for the plan.
   *
   * @returns Redirects to the confirmation URL for the payment.
   *
   * @example
   * <caption>Using a custom return URL.</caption>
   * <description>Change where the merchant is returned to after approving the purchase using the `returnUrl` option.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs } from "@remix-run/node";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   await billing.require({
   *     plans: [MONTHLY_PLAN],
   *     onFailure: async () => billing.request({
   *       plan: MONTHLY_PLAN,
   *       isTest: true,
   *       returnUrl: 'https://admin.shopify.com/store/my-store/apps/my-app/billing-page',
   *     }),
   *   });
   *
   *   // App logic
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-remix/server";
   *
   * export const MONTHLY_PLAN = 'Monthly subscription';
   * export const ANNUAL_PLAN = 'Annual subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [MONTHLY_PLAN]: {
   *       lineItems: [
   *         amount: 5,
   *         currencyCode: 'USD',
   *         interval: BillingInterval.Every30Days,
   *       ],
   *     },
   *     [ANNUAL_PLAN]: {
   *       lineItems: [
   *         amount: 50,
   *         currencyCode: 'USD',
   *         interval: BillingInterval.Annual,
   *       ],
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   *
   * @example
   * <caption>Overriding plan settings.</caption>
   * <description>Customize the plan for a merchant when requesting billing. Any fields from the plan can be overridden, as long as the billing interval for line items matches the config.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs } from "@remix-run/node";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   await billing.require({
   *     plans: [MONTHLY_PLAN],
   *     onFailure: async () => billing.request({
   *       plan: MONTHLY_PLAN,
   *       isTest: true,
   *       trialDays: 14,
   *       lineItems: [
   *         {
   *           interval: BillingInterval.Every30Days,
   *           discount: { value: { percentage: 0.1 } },
   *         },
   *       ],
   *     }),
   *   });
   *
   *   // App logic
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-remix/server";
   *
   * export const MONTHLY_PLAN = 'Monthly subscription';
   * export const ANNUAL_PLAN = 'Annual subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [MONTHLY_PLAN]: {
   *       lineItems: [
   *         amount: 5,
   *         currencyCode: 'USD',
   *         interval: BillingInterval.Every30Days,
   *       ],
   *     },
   *     [ANNUAL_PLAN]: {
   *       lineItems: [
   *         amount: 50,
   *         currencyCode: 'USD',
   *         interval: BillingInterval.Annual,
   *       ],
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  request: (options: RequestBillingOptions<Config>) => Promise<never>;

  /**
   * Cancels an ongoing subscription, given its ID.
   *
   * @returns The cancelled subscription.
   *
   * @example
   * <caption>Cancelling a subscription.</caption>
   * <description>Use the `billing.cancel` function to cancel an active subscription with the id returned from `billing.require`.</description>
   * ```ts
   * // /app/routes/cancel-subscription.ts
   * import { LoaderFunctionArgs } from "@remix-run/node";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   const billingCheck = await billing.require({
   *     plans: [MONTHLY_PLAN],
   *     onFailure: async () => billing.request({ plan: MONTHLY_PLAN }),
   *   });
   *
   *   const subscription = billingCheck.appSubscriptions[0];
   *   const cancelledSubscription = await billing.cancel({
   *     subscriptionId: subscription.id,
   *     isTest: true,
   *     prorate: true,
   *    });
   *
   *   // App logic
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-remix/server";
   *
   * export const MONTHLY_PLAN = 'Monthly subscription';
   * export const ANNUAL_PLAN = 'Annual subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [MONTHLY_PLAN]: {
   *       lineItems: [
   *         amount: 5,
   *         currencyCode: 'USD',
   *         interval: BillingInterval.Every30Days,
   *       ],
   *     },
   *     [ANNUAL_PLAN]: {
   *       lineItems: [
   *         amount: 50,
   *         currencyCode: 'USD',
   *         interval: BillingInterval.Annual,
   *       ],
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  cancel: (options: CancelBillingOptions) => Promise<AppSubscription>;

  /**
   * Creates a usage record for an app subscription.
   *
   * @returns Returns a usage record when one was created successfully.
   *
   * @example
   * <caption>Creating a usage record</caption>
   * <description>Create a usage record for the active usage billing plan</description>
   * ```ts
   * // /app/routes/create-usage-record.ts
   * import { ActionFunctionArgs } from "@remix-run/node";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *    const { billing } = await authenticate.admin(request);
   *
   *   const chargeBilling = await billing.createUsageRecord({
   *      description: "Usage record for product creation",
   *      price: {
   *        amount: 1,
   *        currencyCode: "USD",
   *       },
   *      isTest: true,
   *    });
   *  console.log(chargeBilling);
   *
   *   // App logic
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-remix/server";
   *
   * export const USAGE_PLAN = 'Usage subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [USAGE_PLAN]: {
   *       lineItems: [
   *         amount: 5,
   *         currencyCode: 'USD',
   *         interval: BillingInterval.Usage,
   *       ],
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  createUsageRecord: (
    options: CreateUsageRecordOptions,
  ) => Promise<UsageRecord>;
}
