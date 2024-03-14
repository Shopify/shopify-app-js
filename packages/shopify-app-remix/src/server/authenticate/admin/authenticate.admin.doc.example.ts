import {type ActionFunctionArgs, json} from '@remix-run/node';
import {GraphqlQueryError} from '@shopify/shopify-api';

import {authenticate} from '../shopify.server';

export const action = async ({request}: ActionFunctionArgs) => {
  const {admin, redirect} = await authenticate.admin(request);

  try {
    await admin.graphql(
      `#graphql
      mutation updateProductTitle($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
          }
        }
      }`,
      {
        variables: {
          input: {id: '123', title: 'New title'},
        },
      },
    );

    return redirect('/app/product-updated');
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      return json({errors: error.body?.errors}, {status: 500});
    }

    return new Response('Failed to update product title', {status: 500});
  }
};
