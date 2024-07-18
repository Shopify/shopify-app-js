import {LATEST_API_VERSION} from '@shopify/shopify-api';

import {TEST_SHOP, mockExternalRequest} from '../../../../__test-helpers';

export async function mockGraphqlRequest(
  status = 401,
  responseContent?: string,
) {
  const requestMock = new Request(
    `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/graphql.json`,
    {method: 'POST'},
  );

  await mockExternalRequest({
    request: requestMock,
    response: new Response(responseContent, {status}),
  });

  return requestMock;
}
