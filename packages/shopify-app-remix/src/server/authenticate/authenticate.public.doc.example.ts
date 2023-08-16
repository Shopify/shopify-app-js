import {ActionFunction, LoaderFunction, json} from '@remix-run/node';

import shopify from '~/shopify.server';

// The loader responds to preflight requests from Shopify
export const loader: LoaderFunction = async ({request}) => {
  await shopify.authenticate.public(request);
};

// The action responds to the POST request from the extension. Make sure to use the cors helper for the request to work.
export const action: ActionFunction = async ({request}) => {
  const {cors} = await shopify.authenticate.public(request);

  const myData = customAppCode();

  return cors(json({myData}));
};
