import {LoaderFunction, ActionFunction, json} from '@remix-run/node';

import shopify from '~/shopify.server';

export const loader: LoaderFunction = async ({request}) => {
  // errors.shop will be filled if there are issues
  const errors = await shopify.login(request);

  return json({errors});
};

export const action: ActionFunction = async ({request}) => {
  const errors = await shopify.login(request);

  return json({errors});
};
