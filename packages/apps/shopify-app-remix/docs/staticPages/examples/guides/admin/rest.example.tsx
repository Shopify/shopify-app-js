import {LoaderFunction, json} from '@remix-run/node';
import {useRouteError} from '@remix-run/react';

import {authenticate} from '~/shopify.server';

export const loader: LoaderFunction = async ({request}) => {
  const {admin, session} = await authenticate.admin(request);

  // Use REST resources
  const data = await admin.rest.resources.Product.count({session});

  // Or use the REST client
  const response = await admin.rest.get({path: 'products/count'});
  const data = response.body;

  return json({productCount: data.count});
};
