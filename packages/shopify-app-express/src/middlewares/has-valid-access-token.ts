import {HttpResponseError, Session, Shopify} from '@shopify/shopify-api';

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

export async function hasValidAccessToken(
  api: Shopify,
  session: Session,
): Promise<boolean> {
  try {
    const client = new api.clients.Graphql({session});
    await client.query({data: TEST_GRAPHQL_QUERY});
    return true;
  } catch (error) {
    if (error instanceof HttpResponseError && error.response.code === 401) {
      // Re-authenticate if we get a 401 response
      return false;
    } else {
      throw error;
    }
  }
}
