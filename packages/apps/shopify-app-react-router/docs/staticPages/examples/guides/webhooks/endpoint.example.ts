import {ActionFunctionArgs} from '@remix-run/node';

import db from '../db.server';

import {authenticate} from '~/shopify.server';

export const action = async ({request}: ActionFunctionArgs) => {
  const {topic, shop, session} = await authenticate.webhook(request);

  switch (topic) {
    case 'APP_UNINSTALLED':
      // Webhook requests can trigger after an app is uninstalled
      // If the app is already uninstalled, the session may be undefined.
      if (session) {
        await db.session.deleteMany({where: {shop}});
      }
      break;
    case 'CUSTOMERS_DATA_REQUEST':
    case 'CUSTOMERS_REDACT':
    case 'SHOP_REDACT':
    default:
      throw new Response('Unhandled webhook topic', {status: 404});
  }

  throw new Response();
};
