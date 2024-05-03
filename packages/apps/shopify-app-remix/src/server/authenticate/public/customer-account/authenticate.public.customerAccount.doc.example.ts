import type {ActionFunctionArgs, LoaderFunctionArgs} from '@remix-run/node';
import {json} from '@remix-run/node';

import {authenticate} from '../shopify.server';
import {getOffers} from '../offers.server';

// The loader responds to preflight requests from Shopify
export const loader = async ({request}: LoaderFunctionArgs) => {
  await authenticate.public.customerAccount(request);
};

export const action = async ({request}: ActionFunctionArgs) => {
  const {cors, sessionToken} = await authenticate.public.customerAccount(request);

  // Get offers for the customer
  const offers = getOffers(sessionToken.des, sessionToken.sub);
  return cors(json({offers}));
};
