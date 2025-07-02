import {LoaderFunction} from 'react-router';

import {authenticate} from '~/shopify.server';

export const loader: LoaderFunction = async ({request}) => {
  const {cors} = await authenticate.admin(request);

  // App logic

  return cors({my: 'data'});
};
