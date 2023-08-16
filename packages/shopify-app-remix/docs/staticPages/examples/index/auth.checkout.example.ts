import {json} from '@remix-run/node';

import shopify from '~/shopify.server';

export const action = async ({request}) => {
  const {cors} = await shopify.authenticate.public(request, {
    corsHeaders: ['Content-Type'],
  });

  // Perform required actions

  return cors(json({data}));
};
