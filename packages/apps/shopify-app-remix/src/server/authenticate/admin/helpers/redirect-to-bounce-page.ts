import {redirect} from '@remix-run/server-runtime';

import {BasicParams} from '../../../types';

export const redirectToBouncePage = (params: BasicParams, url: URL): never => {
  const {config} = params;

  // Make sure we always point to the configured app URL so it also works behind reverse proxies (that alter the Host
  // header).
  const searchParams = url.searchParams;
  searchParams.delete('id_token');
  searchParams.set(
    'shopify-reload',
    `${config.appUrl}${url.pathname}?${searchParams.toString()}`,
  );

  // eslint-disable-next-line no-warning-comments
  // TODO Make sure this works on chrome without a tunnel (weird HTTPS redirect issue)
  // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28376650
  throw redirect(
    `${config.auth.patchSessionTokenPath}?${searchParams.toString()}`,
  );
};
