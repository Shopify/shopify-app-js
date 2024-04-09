import {LoaderFunction, ActionFunction} from '@remix-run/node';

import {authenticate} from '~/shopify.server';

export const loader: LoaderFunction = async ({request}) => {
  await authenticate.admin(request);

  // App logic

  return null;
};

export const action: ActionFunction = async ({request}) => {
  await authenticate.admin(request);

  // App logic

  return null;
};
