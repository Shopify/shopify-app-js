import {LoaderFunction} from '@remix-run/node';

import {authenticate, MONTHLY_PLAN, ANNUAL_PLAN} from '../shopify.server';

export const loader: LoaderFunction = async ({request}) => {
  const {billing, redirect} = await authenticate.admin(request);
  await billing.require({
    plans: [MONTHLY_PLAN, ANNUAL_PLAN],
    isTest: true,
    onFailure: () => redirect('/select-plan'),
  });

  // App logic
};
