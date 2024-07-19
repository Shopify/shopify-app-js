import {LATEST_API_VERSION} from '@shopify/shopify-api';

import {TEST_SHOP} from './const';
import {mockExternalRequest} from './request-mock';

export function mockGraphqlRequest(apiVersion = LATEST_API_VERSION) {
  return async function (status = 401, responseContent?: string) {
    const requestMock = new Request(
      `https://${TEST_SHOP}/admin/api/${apiVersion}/graphql.json`,
      {method: 'POST'},
    );

    await mockExternalRequest({
      request: requestMock,
      response: new Response(responseContent, {status}),
    });

    return requestMock;
  };
}
