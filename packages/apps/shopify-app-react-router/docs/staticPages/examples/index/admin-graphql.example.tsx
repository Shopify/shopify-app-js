export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin } = await authenticate.admin(request);
 
    const response = await admin.graphql(
      `#graphql
        mutation populateProduct($product: ProductCreateInput!) {
          productCreate(product: $product) {
            product {
              id
              variants(first: 10) {
                  nodes {
                    id
                    createdAt
                  }
                }
              }
            }
          }
        }`,
      {
        variables: {
          product: {
            title: 'Test Product',
          },
        },
      },
    );
    const responseJson = await response.json();
  };