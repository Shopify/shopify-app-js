import {LoaderFunctionArgs} from 'react-router';

import shopify from '~/shopify.server';

export async function loader({request}: LoaderFunctionArgs) {
  await shopify.authenticate.admin(request);

  // App logic goes here

  return null;
}
