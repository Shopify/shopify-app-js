import {json} from '@remix-run/node';

import shopify from '~/shopify.server';

export const loader = async ({request}) => {
  const {admin} = await shopify.authenticate.admin(request);

  const response = await admin.graphql('myQuery');
  const body = await response.json();

  return json({shop: body.data.shop.name});
};
