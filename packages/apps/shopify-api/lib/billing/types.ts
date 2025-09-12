import {BillingInterval, BillingReplacementBehavior} from '../types';
import {Session} from '../session/session';
import {FeatureEnabled, FutureFlagOptions} from '../../future/flags';

export interface BillingConfigPlan {
  /**
   * Amount to charge for this plan.
   */
  amount: number;
  /**
   * Currency code for this plan.
   */
  currencyCode: string;
}

export interface BillingConfigOneTimePlan extends BillingConfigPlan {
  /**
   * Interval for this plan.
   *
   * Must be set to `OneTime`.
   */
  interval: BillingInterval.OneTime;
}

export interface BillingConfigSubscriptionPlanDiscountAmount {
  /**
   * The amount to discount.
   *
   * Cannot be set if `percentage` is set.
   */
  amount: number;
  /**
   * The percentage to discount.
   *
   * Cannot be set if `amount` is set.
   */
  percentage?: never;
}

export interface BillingConfigSubscriptionPlanDiscountPercentage {
  /**
   * The amount to discount.
   *
   * Cannot be set if `percentage` is set.
   */
  amount?: never;
  /**
   * The percentage to discount.
   *
   * Cannot be set if `amount` is set.
   */
  percentage: number;
}

export interface BillingConfigSubscriptionPlanDiscount {
  /**
   * The number of intervals to apply the discount for.
   */
  durationLimitInIntervals?: number;
  /**
   * The discount to apply.
   */
  value:
    | BillingConfigSubscriptionPlanDiscountAmount
    | BillingConfigSubscriptionPlanDiscountPercentage;
}

export type BillingConfigItem =
  | BillingConfigOneTimePlan
  | BillingConfigSubscriptionLineItemPlan;

// Type this as an interface to improve TSDoc support for it.

/**
 * Billing configuration options, indexed by an app-specific plan name.
 */
export interface BillingConfig {
  /**
   * An individual billing plan.
   */
  [plan: string]: BillingConfigItem;
}

export type RequestConfigOverrides = Partial<BillingConfigOneTimePlan>;

export interface BillingConfigLineItem {
  /**
   * The amount to charge for this line item.
   */
  amount: number;
  /**
   * The currency code for this line item.
   */
  currencyCode: string;
}

export interface BillingConfigRecurringLineItem extends BillingConfigLineItem {
  /**
   * The recurring interval for this line item.
   *
   * Must be either `Every30Days` or `Annual`.
   */
  interval: BillingInterval.Every30Days | BillingInterval.Annual;
  /**
   * An optional discount to apply for this line item.
   */
  discount?: BillingConfigSubscriptionPlanDiscount;
}

export interface BillingConfigUsageLineItem extends BillingConfigLineItem {
  /**
   * The usage interval for this line item.
   *
   * Must be set to `Usage`.
   */
  interval: BillingInterval.Usage;
  /**
   * The capped amount or the maximum amount to be charged in the interval.
   */
  amount: number;
  /**
   * Usage terms for this line item.
   */
  terms: string;
}

export interface BillingConfigSubscriptionLineItemPlan {
  /**
   * The replacement behavior to use for this plan.
   */
  replacementBehavior?: BillingReplacementBehavior;
  /**
   * How many trial days to give before charging for this plan.
   */
  trialDays?: number;
  /**
   * The line items for this plan.
   */
  lineItems: (BillingConfigRecurringLineItem | BillingConfigUsageLineItem)[];
}

type DeepPartial<T> = T extends object
  ? {[P in keyof T]?: DeepPartial<T[P]>}
  : T;
export type RequestConfigLineItemOverrides =
  DeepPartial<BillingConfigSubscriptionLineItemPlan>;

interface BillingCheckParamsNew {
  /**
   * The session to use for this check.
   */
  session: Session;
  /**
   * The plans to accept for this check.
   */
  plans?: string[] | string;
  /**
   * Whether to include charges that were created on test mode. Test shops and demo shops cannot be charged.
   */
  isTest?: boolean;
}

interface BillingCheckParamsOld extends BillingCheckParamsNew {
  /**
   * The plans to accept for this check.
   */
  plans: string[] | string;
  /**
   * Whether to return the full response object.
   */
  returnObject?: boolean;
}

export type BillingCheckParams<
  Future extends FutureFlagOptions = FutureFlagOptions,
> =
  FeatureEnabled<Future, 'unstable_managedPricingSupport'> extends true
    ? BillingCheckParamsNew
    : BillingCheckParamsOld;

export interface BillingCheckResponseObject {
  /**
   * Whether the user has an active payment method.
   */
  hasActivePayment: boolean;
  /**
   * The one-time purchases the shop has.
   */
  oneTimePurchases: OneTimePurchase[];
  /**
   * The active subscriptions the shop has.
   */
  appSubscriptions: AppSubscription[];
}

export type BillingCheckResponse<
  Params extends BillingCheckParams<Future>,
  Future extends FutureFlagOptions = FutureFlagOptions,
> =
  FeatureEnabled<Future, 'unstable_managedPricingSupport'> extends true
    ? BillingCheckResponseObject
    : Params extends BillingCheckParamsOld
      ? Params['returnObject'] extends true
        ? BillingCheckResponseObject
        : boolean
      : never;

type BillingRequestOverridesType = RequestConfigOverrides &
  RequestConfigLineItemOverrides;

export type BillingRequestParams = {
  /**
   * The session to use for this request.
   */
  session: Session;
  /**
   * The plan to request.
   */
  plan: string;
  /**
   * Whether this is a test purchase.
   */
  isTest?: boolean;
  /**
   * Override the return URL after the purchase is complete.
   */
  returnUrl?: string;
  /**
   * Whether to return the full response object.
   */
  returnObject?: boolean;
} & BillingRequestOverridesType;

export interface BillingRequestResponseObject {
  /**
   * The confirmation URL for this request.
   */
  confirmationUrl: string;
  /**
   * The one-time purchase created by this request.
   */
  oneTimePurchase?: OneTimePurchase;
  /**
   * The app subscription created by this request.
   */
  appSubscription?: AppSubscription;
}

export type BillingRequestResponse<Params extends BillingRequestParams> =
  Params['returnObject'] extends true ? BillingRequestResponseObject : string;

export interface BillingCancelParams {
  /**
   * The session to use for this request.
   */
  session: Session;
  /**
   * The subscription ID to cancel.
   */
  subscriptionId: string;
  /**
   * Whether to prorate the cancellation.
   */
  prorate?: boolean;
  /**
   * Whether to consider test purchases.
   */
  isTest?: boolean;
}

export interface BillingSubscriptionParams {
  /**
   * The session to use for this request.
   */
  session: Session;
}

export interface AppSubscription {
  /**
   * The ID of the app subscription.
   */
  id: string;
  /**
   * The name of the purchased plan.
   */
  name: string;
  /**
   * Whether this is a test subscription.
   */
  test: boolean;
  /**
   * The number of trial days for this subscription.
   */
  trialDays: number;
  /**
   * The date and time when the subscription was created.
   */
  createdAt: string;
  /**
   * The date and time when the current period ends.
   */
  currentPeriodEnd: string;
  /**
   * The return URL for this subscription.
   */
  returnUrl: string;

  /*
   * The line items for this plan.
   */
  lineItems: ActiveSubscriptionLineItem[];

  /*
   * The status of the subscription. [ACTIVE, CANCELLED, PENDING, DECLINED, EXPIRED, FROZEN, ACCEPTED]
   */
  status:
    | 'ACTIVE'
    | 'CANCELLED'
    | 'PENDING'
    | 'DECLINED'
    | 'EXPIRED'
    | 'FROZEN'
    | 'ACCEPTED';
}

export interface ActiveSubscriptions {
  activeSubscriptions: AppSubscription[];
}

export interface ActiveSubscriptionLineItem {
  /*
   * The ID of the line item.
   */
  id: string;
  /*
   * The details of the plan.
   */
  plan: AppPlan;
}

export interface RecurringAppPlan {
  /*
   * The interval for this plan is charged on.
   */
  interval: BillingInterval.Every30Days | BillingInterval.Annual;
  /*
   * The price of the plan.
   */
  price: Money;
  /*
   * The discount applied to the plan.
   */
  discount: AppPlanDiscount;
}

export interface UsageAppPlan {
  /*
   * The total usage records for interval.
   */
  balanceUsed: Money;
  /*
   * The capped amount prevents the merchant from being charged for any usage over that amount during a billing period.
   */
  cappedAmount: Money;
  /*
   * The terms and conditions for app usage pricing.
   */
  terms: string;
}

export interface Money {
  amount: number;
  currencyCode: string;
}

export interface AppPlanDiscount {
  /*
   * The total number of intervals the discount applies to.
   */
  durationLimitInIntervals: number;
  /*
   * The remaining number of intervals the discount applies to.
   */
  remainingDurationInIntervals: number;
  /*
   * The price after the discount is applied.
   */
  priceAfterDiscount: Money;
  /*
   * The value of the discount applied every billing interval.
   */
  value: AppPlanDiscountAmount;
}

export interface AppSubscriptionLineItemUpdatePayload {
  userErrors: string[];
  confirmationUrl: string;
  appSubscription: AppSubscription;
}

export type UpdateCappedAmountConfirmation = Omit<
  AppSubscriptionLineItemUpdatePayload,
  'userErrors'
>;

type AppPlanDiscountAmount =
  | BillingConfigSubscriptionPlanDiscountAmount
  | BillingConfigSubscriptionPlanDiscountPercentage;

export interface AppPlan {
  /*
   * The pricing details of the plan.
   */
  pricingDetails: RecurringAppPlan | UsageAppPlan;
}
export interface OneTimePurchase {
  /**
   * The ID of the one-time purchase.
   */
  id: string;
  /**
   * The name of the purchased plan.
   */
  name: string;
  /**
   * Whether this is a test purchase.
   */
  test: boolean;
  /*
   * The status of the subscription. [ACTIVE, CANCELLED, PENDING, DECLINED, EXPIRED, FROZEN, ACCEPTED]
   */
  status:
    | 'ACTIVE'
    | 'CANCELLED'
    | 'PENDING'
    | 'DECLINED'
    | 'EXPIRED'
    | 'FROZEN'
    | 'ACCEPTED';
}

export interface BillingCreateUsageRecordParams {
  /**
   * The session to use for this request.
   */
  session: Session;
  /**
   * The description of the usage record.
   */
  description: string;
  /**
   * The price and currency of the usage record.
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
   * The subscription line item ID to associate the usage record with.
   */
  subscriptionLineItemId?: string;
  /**
   * The idempotency key for this request.
   */
  idempotencyKey?: string;
  /**
   * Whether this is a test charge.
   * */
  isTest?: boolean;
}

export interface UsageRecord {
  /**
   * The ID of the usage record.
   */
  id: string;
  /**
   * The description of the usage record.
   */
  description: string;
  /**
   * The price and currency of the usage record.
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
   * The subscription line item associated with the usage record.
   */
  plan: ActiveSubscriptionLineItem;
  /**
   * The idempotency key for this request.
   */
  idempotencyKey?: string;
  /**
   * The subscription line item associated with the usage record.
   */
  subscriptionLineItem: AppSubscriptionLineItem;
}

export interface AppSubscriptionLineItem {
  /**
   * The ID of the subscription line item.
   */
  id: string;
  /**
   * The plan associated with the subscription line item.
   */
  plan: AppPlan;
}

export interface BillingUpdateUsageCappedAmountParams {
  /**
   * The session to use for this request.
   */
  session: Session;
  /**
   * The subscription line item ID to update.
   */
  subscriptionLineItemId: string;
  /**
   * The maximum charge for the usage billing plan.
   */
  cappedAmount: {
    /**
     * The amount to update.
     */
    amount: number;
    /**
     * The currency code to update.
     */
    currencyCode: string;
  };
}

interface OneTimePurchases {
  oneTimePurchases: {
    edges: {
      node: OneTimePurchase;
    }[];
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
    };
  };
}

export type CurrentAppInstallation = OneTimePurchases & ActiveSubscriptions;

export interface CurrentAppInstallations {
  currentAppInstallation?: CurrentAppInstallation;
}

export interface RequestResponse {
  userErrors: string[];
  confirmationUrl: string;
}

interface AppSubscriptionCreate {
  userErrors: string[];
  confirmationUrl: string;
  appSubscription: AppSubscription;
}

interface AppPurchaseOneTimeCreate {
  userErrors: string[];
  confirmationUrl: string;
  oneTimePurchase: OneTimePurchase;
}

export interface RecurringPaymentResponse {
  appSubscriptionCreate?: AppSubscriptionCreate;
}

export interface SinglePaymentResponse {
  appPurchaseOneTimeCreate?: AppPurchaseOneTimeCreate;
}

export type RequestResponseData =
  | AppSubscriptionCreate
  | AppPurchaseOneTimeCreate;

export interface SubscriptionResponse {
  currentAppInstallation?: ActiveSubscriptions;
}

export interface CancelResponse {
  appSubscriptionCancel?: {
    appSubscription: AppSubscription;
    userErrors: string[];
  };
}

export interface UsageRecordCreateResponse {
  appUsageRecordCreate?: {
    appUsageRecord: UsageRecord;
    userErrors: string[];
  };
}

export interface BillingUpdateUsageCappedAmountResponse {
  appSubscriptionLineItemUpdate?: AppSubscriptionLineItemUpdatePayload;
}

export type BillingCheck<Future extends FutureFlagOptions> = <
  Params extends BillingCheckParams<Future>,
>(
  params: Params,
) => Promise<BillingCheckResponse<Params, Future>>;

export type BillingRequest = <Params extends BillingRequestParams>(
  params: Params,
) => Promise<BillingRequestResponse<Params>>;

export type BillingCancel = (
  params: BillingCancelParams,
) => Promise<AppSubscription>;

export type BillingSubscriptions = (
  params: BillingSubscriptionParams,
) => Promise<ActiveSubscriptions>;

export type BillingCreateUsageRecord = (
  params: BillingCreateUsageRecordParams,
) => Promise<UsageRecord>;

export type BillingUpdateUsageCappedAmount = (
  params: BillingUpdateUsageCappedAmountParams,
) => Promise<UpdateCappedAmountConfirmation>;

export interface ShopifyBilling<Future extends FutureFlagOptions> {
  check: BillingCheck<Future>;
  request: BillingRequest;
  cancel: BillingCancel;
  subscriptions: BillingSubscriptions;
  createUsageRecord: BillingCreateUsageRecord;
  updateUsageCappedAmount: BillingUpdateUsageCappedAmount;
}

export const APP_SUBSCRIPTION_FRAGMENT = `
  fragment AppSubscriptionFragment on AppSubscription {
    id
    name
    test
    status
    trialDays
    createdAt
    currentPeriodEnd
    returnUrl
    lineItems {
      id
      plan {
        pricingDetails {
          ... on AppRecurringPricing {
            price {
              amount
              currencyCode
            }
            interval
            discount {
              durationLimitInIntervals
              remainingDurationInIntervals
              priceAfterDiscount {
                amount
              }
              value {
                ... on AppSubscriptionDiscountAmount {
                  amount {
                    amount
                    currencyCode
                  }
                }
                ... on AppSubscriptionDiscountPercentage {
                  percentage
                }
              }
            }
          }
          ... on AppUsagePricing {
            balanceUsed {
              amount
              currencyCode
            }
            cappedAmount {
              amount
              currencyCode
            }
            terms
          }
        }
      }
    }
  }
`;
