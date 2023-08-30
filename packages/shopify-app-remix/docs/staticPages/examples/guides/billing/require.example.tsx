import {LoaderFunction} from '@remix-run/node';

import {authenticate, MONTHLY_PLAN} from '../shopify.server';

export const loader: LoaderFunction = async ({request}) => {
  const {billing} = await authenticate.admin(request);
  const billingData = await billing.require({
    plans: [MONTHLY_PLAN],
    isTest: true,
    onFailure: async () => billing.request({plan: MONTHLY_PLAN}),
  });

  // App logic
};
