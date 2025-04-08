import {ConfigInterface} from '../base-types';
import {graphqlClientClass} from '../clients/admin';
import {BillingError, GraphqlQueryError} from '../error';

import {
  AppSubscription,
  BillingCancel,
  BillingCancelParams,
  CancelResponse,
  APP_SUBSCRIPTION_FRAGMENT,
} from './types';

const CANCEL_MUTATION = `
  ${APP_SUBSCRIPTION_FRAGMENT}
  mutation appSubscriptionCancel($id: ID!, $prorate: Boolean) {
    appSubscriptionCancel(id: $id, prorate: $prorate) {
      appSubscription {
        ...AppSubscriptionFragment
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export function cancel(config: ConfigInterface): BillingCancel {
  return async function (
    subscriptionInfo: BillingCancelParams,
  ): Promise<AppSubscription> {
    const {session, subscriptionId, prorate = true} = subscriptionInfo;

    const GraphqlClient = graphqlClientClass({config});
    const client = new GraphqlClient({session});

    try {
      const response = await client.request<CancelResponse>(CANCEL_MUTATION, {
        variables: {id: subscriptionId, prorate},
      });

      if (response.data?.appSubscriptionCancel?.userErrors.length) {
        throw new BillingError({
          message: 'Error while canceling a subscription',
          errorData: response.data?.appSubscriptionCancel?.userErrors,
        });
      }

      return response.data?.appSubscriptionCancel?.appSubscription!;
    } catch (error) {
      if (error instanceof GraphqlQueryError) {
        throw new BillingError({
          message: error.message,
          errorData: error.response?.errors,
        });
      } else {
        throw error;
      }
    }
  };
}
