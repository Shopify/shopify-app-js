import {LoaderArgs} from '@remix-run/node';

import shopify from '~/shopify.server';

export async function loader({request}: LoaderArgs) {
  await shopify.authenticate.admin(request);

  // App logic goes here

  return null;
}
