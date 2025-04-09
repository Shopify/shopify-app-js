import {BillingError} from '../error';
import {ConfigInterface} from '../base-types';
import {graphqlClientClass} from '../clients/admin';

import {
  ActiveSubscriptions,
  BillingSubscriptionParams,
  BillingSubscriptions,
  SubscriptionResponse,
  APP_SUBSCRIPTION_FRAGMENT,
} from './types';
import {convertLineItems} from './utils';

const SUBSCRIPTION_QUERY = `
${APP_SUBSCRIPTION_FRAGMENT}
query appSubscription {
  currentAppInstallation {
    activeSubscriptions {
      ...AppSubscriptionFragment
    }
  }
}
`;

export function subscriptions(config: ConfigInterface): BillingSubscriptions {
  return async function ({
    session,
  }: BillingSubscriptionParams): Promise<ActiveSubscriptions> {
    if (!config.future?.unstable_managedPricingSupport && !config.billing) {
      throw new BillingError({
        message: 'Attempted to look for purchases without billing configs',
        errorData: [],
      });
    }

    const GraphqlClient = graphqlClientClass({config});
    const client = new GraphqlClient({session});

    const response =
      await client.request<SubscriptionResponse>(SUBSCRIPTION_QUERY);

    if (!response.data?.currentAppInstallation?.activeSubscriptions) {
      return {activeSubscriptions: []};
    }

    const activeSubscriptions =
      response.data.currentAppInstallation.activeSubscriptions;
    activeSubscriptions.forEach((subscription) => {
      if (subscription.lineItems) {
        subscription.lineItems = convertLineItems(subscription.lineItems);
      }
    });

    return {
      activeSubscriptions,
    };
  };
}
