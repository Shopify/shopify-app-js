import shopify from '~/shopify.server';

export const action = async ({request}) => {
  const {topic, shop} = await shopify.authenticate.webhook(request);

  switch (topic) {
    case 'APP_UNINSTALLED':
      // Delete shop data from database
      break;
  }

  throw new Response();
};
