import {BillingError, GraphqlQueryError} from '../error';
import {ConfigInterface} from '../base-types';
import {graphqlClientClass} from '../clients/admin';

import {
  BillingUpdateUsageCharge,
  BillingUpdateUsageChargeParams,
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
    }
  }
}
`;

export function updateMaxUsageCharge(
  config: ConfigInterface,
): BillingUpdateUsageCharge {
  return async function updateMaxUsageCharge(
    params: BillingUpdateUsageChargeParams,
  ): Promise<unknown> {
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
      const response = await client.request(UPDATE_MAX_USAGE_CHARGE_MUTATION, {
        variables: {
          id: subscriptionLineItemId,
          cappedAmount: {
            amount,
            currencyCode,
          },
        },
      });

      return response;
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
