import {authenticate} from '~/shopify.server';

export const action = async ({request}) => {
  const {topic} = await authenticate.webhook(request);

  switch (topic) {
    case 'APP_UNINSTALLED':
      // Do something when the app is uninstalled
      break;
    default:
      throw new Response('Unhandled webhook topic', {status: 404});
  }

  throw new Response();
};
