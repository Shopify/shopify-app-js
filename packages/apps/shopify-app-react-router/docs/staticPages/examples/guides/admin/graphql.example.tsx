import {ActionFunction} from 'react-router';

import {authenticate} from '../shopify.server';

export const action: ActionFunction = async ({request}) => {
  const {admin} = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
    mutation populateProduct($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
        }
      }
    }`,
    {
      variables: {
        input: {
          title: 'New product',
          variants: [{price: 100}],
        },
      },
    },
  );
  const parsedResponse = await response.json();

  return {data: parsedResponse.data};
};
