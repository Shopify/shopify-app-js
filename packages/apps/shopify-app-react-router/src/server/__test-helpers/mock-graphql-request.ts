import {LATEST_API_VERSION} from '@shopify/shopify-api';

import {TEST_SHOP} from './const';
import {mockExternalRequest, mockExternalRequests} from './request-mock';

export interface MockGraphqlRequestArg {
  status?: number;
  responseContent?: string;
  body?: string;
}

export function mockGraphqlRequest(
  apiVersion = LATEST_API_VERSION,
  shopUrl = TEST_SHOP,
) {
  return async function ({
    status = 401,
    responseContent,
  }: MockGraphqlRequestArg = {}) {
    const requestMock = new Request(
      `https://${shopUrl}/admin/api/${apiVersion}/graphql.json`,
      {method: 'POST'},
    );

    await mockExternalRequest({
      request: requestMock,
      response: new Response(responseContent, {status}),
    });

    return requestMock;
  };
}

export function mockGraphqlRequests(
  apiVersion = LATEST_API_VERSION,
  shopUrl = TEST_SHOP,
) {
  return async function (...mocks: MockGraphqlRequestArg[]) {
    const mockedRequests: Request[] = [];
    const externalRequests = mocks.map(
      ({body, responseContent, status = 200}) => {
        const requestMock = new Request(
          `https://${shopUrl}/admin/api/${apiVersion}/graphql.json`,
          {method: 'POST', ...(body ? {body} : {})},
        );

        mockedRequests.push(requestMock);

        return {
          request: requestMock,
          response: new Response(responseContent, {status}),
        };
      },
    );

    await mockExternalRequests(...externalRequests);

    return mockedRequests;
  };
}
