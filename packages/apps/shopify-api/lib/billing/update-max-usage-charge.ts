import {BillingError, GraphqlQueryError} from '../error';
import {ConfigInterface} from '../base-types';
import {graphqlClientClass} from '../clients/admin';

import {
  AppSubscriptionLineItemUpdatePayload,
  BillingUpdateUsageCharge,
  BillingUpdateUsageChargeParams,
  BillingUpdateUsageChargeResponse,
} from './types';

const UPDATE_MAX_USAGE_CHARGE_MUTATION = `
mutation appSubscriptionLineItemUpdate($cappedAmount: MoneyInput!, $id: ID!) {
  appSubscriptionLineItemUpdate(cappedAmount: $cappedAmount, id: $id) {
    userErrors {
      field
      message
    }
    confirmationUrl
    appSubscription {
      id
      name
      test
      lineItems {
        id
        plan {
          pricingDetails {
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
  }
}
`;

export function updateMaxUsageCharge(
  config: ConfigInterface,
): BillingUpdateUsageCharge {
  return async function updateMaxUsageCharge(
    params: BillingUpdateUsageChargeParams,
  ): Promise<AppSubscriptionLineItemUpdatePayload> {
    if (!config.billing) {
      throw new BillingError({
        message: 'Attempted to update line item without billing configs',
        errorData: [],
      });
    }

    const {
      session,
      subscriptionLineItemId,
      cappedAmount: {amount, currencyCode},
    } = params;

    const GraphqlClient = graphqlClientClass({config});
    const client = new GraphqlClient({session});

    try {
      const response = await client.request<BillingUpdateUsageChargeResponse>(
        UPDATE_MAX_USAGE_CHARGE_MUTATION,
        {
          variables: {
            id: subscriptionLineItemId,
            cappedAmount: {
              amount,
              currencyCode,
            },
          },
        },
      );

      return response.data?.appSubscriptionLineItemUpdate!;
    } catch (error) {
      if (error instanceof GraphqlQueryError) {
        throw new BillingError({
          message: error.message,
          errorData: error.response?.errors,
        });
      }

      throw error;
    }
  };
}
