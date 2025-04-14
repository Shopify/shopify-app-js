import {json, LoaderFunction} from '@react-router/node';

import {authenticate} from '~/shopify.server';

export const loader: LoaderFunction = async ({request}) => {
  const {cors} = await authenticate.admin(request);

  // App logic

  return cors(json({my: 'data'}));
};
