import {ConfigInterface} from '../base-types';
import {graphqlClientClass, GraphqlClient} from '../clients/admin';
import {BillingError} from '../error';

import {
  AppSubscription,
  BillingCheckParams,
  BillingCheckResponse,
  BillingCheckResponseObject,
  BillingCheckResults,
  CurrentAppInstallation,
  CurrentAppInstallations,
  OneTimePurchase,
} from './types';

interface GetPaymentsParams {
  client: GraphqlClient;
  isTest: boolean;
}

interface SubscriptionMeetsCriteriaParams {
  subscription: AppSubscription;
  isTest: boolean;
}

interface PurchaseMeetsCriteriaParams {
  purchase: OneTimePurchase;
  isTest: boolean;
}

interface InternalParams {
  payments: BillingCheckResults;
  plans: string[];
}

export function check(config: ConfigInterface) {
  return async function check<Params extends BillingCheckParams>({
    session,
    plans,
    isTest = true,
    returnObject = false,
  }: Params): Promise<BillingCheckResponse<Params>> {
    if (plans && !config.billing) {
      throw new BillingError({
        message:
          'Attempted to look for purchases for specific plans without billing configs',
        errorData: [],
      });
    }

    const GraphqlClient = graphqlClientClass({config});
    const client = new GraphqlClient({session});

    const payments = await getPayments({client, isTest});

    if (plans === undefined) {
      // Not filtering by plans, return everything
      return payments as BillingCheckResponse<Params>;
    } else {
      const plansArray = Array.isArray(plans) ? plans : [plans];

      if (returnObject) {
        // Return the full object
        return assessPayments({
          payments,
          plans: plansArray,
        }) as BillingCheckResponse<Params>;
      } else {
        // Just return a boolean
        return hasPayment({
          payments,
          plans: plansArray,
        }) as BillingCheckResponse<Params>;
      }
    }
  };
}

async function getPayments({
  client,
  isTest,
}: GetPaymentsParams): Promise<BillingCheckResults> {
  const returnValue: BillingCheckResults = {
    oneTimePurchases: [],
    appSubscriptions: [],
  };

  let installation: CurrentAppInstallation;
  let endCursor: string | null = null;
  do {
    const currentInstallations = await client.request<CurrentAppInstallations>(
      HAS_PAYMENTS_QUERY,
      {variables: {endCursor}},
    );

    installation = currentInstallations.data?.currentAppInstallation!;
    installation.activeSubscriptions.forEach((subscription) => {
      if (subscriptionMeetsCriteria({isTest, subscription})) {
        returnValue.appSubscriptions.push(subscription);
      }
    });
    installation.oneTimePurchases.edges.forEach(({node: purchase}) => {
      if (purchaseMeetsCriteria({isTest, purchase})) {
        returnValue.oneTimePurchases.push(purchase);
      }
    });

    endCursor = installation.oneTimePurchases.pageInfo.endCursor;
  } while (installation?.oneTimePurchases.pageInfo.hasNextPage);

  return returnValue;
}

function assessPayments({
  payments,
  plans,
}: InternalParams): BillingCheckResponseObject {
  const {oneTimePurchases, appSubscriptions} = filterPayments({
    payments,
    plans,
  });

  return {
    hasActivePayment:
      oneTimePurchases.length > 0 || appSubscriptions.length > 0,
    oneTimePurchases,
    appSubscriptions,
  };
}

function hasPayment({payments, plans}: InternalParams): boolean {
  const {oneTimePurchases, appSubscriptions} = filterPayments({
    payments,
    plans,
  });

  return oneTimePurchases.length > 0 || appSubscriptions.length > 0;
}

function filterPayments({
  payments,
  plans,
}: InternalParams): BillingCheckResults {
  return {
    oneTimePurchases: payments.oneTimePurchases.filter((purchase) =>
      plans.includes(purchase.name),
    ),
    appSubscriptions: payments.appSubscriptions.filter((subscription) =>
      plans.includes(subscription.name),
    ),
  };
}

function subscriptionMeetsCriteria({
  subscription,
  isTest,
}: SubscriptionMeetsCriteriaParams): boolean {
  return isTest || !subscription.test;
}

function purchaseMeetsCriteria({
  purchase,
  isTest,
}: PurchaseMeetsCriteriaParams): boolean {
  return (isTest || !purchase.test) && purchase.status === 'ACTIVE';
}

const HAS_PAYMENTS_QUERY = `
  query appSubscription($endCursor: String) {
    currentAppInstallation {
      activeSubscriptions {
        id
        name
        test
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
      oneTimePurchases(first: 250, sortKey: CREATED_AT, after: $endCursor) {
        edges {
          node {
            id
            name
            test
            status
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
