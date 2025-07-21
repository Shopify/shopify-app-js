import {
  ApiVersion,
  HttpMaxRetriesError,
  LATEST_API_VERSION,
  Session,
} from '@shopify/shopify-api';
import fetchMock from 'jest-fetch-mock';

import {
  TEST_SHOP,
  expectAdminApiClient,
  getThrownResponse,
  mockExternalRequest,
  mockGraphqlRequest,
  setUpEmbeddedFlow,
  setUpEmbeddedFlowWithRemoveRestFlag,
  setUpNonEmbeddedFlow,
} from '../../../__test-helpers';
import {AdminApiContextWithRest} from '../../../clients';

describe('admin.authenticate context', () => {
  expectAdminApiClient(async () => {
    const {
      admin,
      expectedSession,
      session: actualSession,
    } = await setUpEmbeddedFlow();

    const {admin: adminWithoutRest} =
      await setUpEmbeddedFlowWithRemoveRestFlag();

    return {admin, adminWithoutRest, expectedSession, actualSession};
  });

  it('re-throws errors other than HttpResponseErrors on GraphQL requests', async () => {
    // GIVEN
    const {admin} = await setUpEmbeddedFlow();

    // WHEN
    await mockGraphqlRequest()({status: 429});
    await mockGraphqlRequest()({status: 429});

    // THEN
    await expect(async () =>
      admin.graphql(
        'mutation myMutation($ID: String!) { shop(ID: $ID) { name } }',
        {variables: {ID: '123'}, tries: 2},
      ),
    ).rejects.toThrowError(HttpMaxRetriesError);
  });

  it('re-throws errors other than HttpResponseErrors on REST requests', async () => {
    // GIVEN
    const {admin} = await setUpEmbeddedFlow();

    // WHEN
    await mockRestRequest(429);
    await mockRestRequest(429);

    // THEN
    await expect(async () =>
      admin.rest.get({path: '/customers.json', tries: 2}),
    ).rejects.toThrowError(HttpMaxRetriesError);
  });

  describe.each([
    {
      testGroup: 'REST client',
      mockRequest: mockRestRequest,
      action: async (admin: AdminApiContextWithRest, _session: Session) =>
        admin.rest.get({path: '/customers.json'}),
    },
    {
      testGroup: 'REST resources',
      mockRequest: mockRestRequest,
      action: async (admin: AdminApiContextWithRest, session: Session) =>
        admin.rest.resources.Customer.all({session}),
    },
  ])(
    '$testGroup re-authentication',
    ({testGroup: _testGroup, mockRequest, action}) => {
      it('throws a response when REST request receives a non-401 response and not embedded', async () => {
        // GIVEN
        const {admin, session} = await setUpNonEmbeddedFlow();
        const requestMock = await mockRequest(403);

        // WHEN
        const response = await getThrownResponse(
          async () => action(admin, session),
          requestMock,
        );

        // THEN
        expect(response.status).toEqual(403);
      });
    },
  );

  describe.each([
    {
      testGroup: 'GraphQL client',
      mockRequest: mockGraphqlRequest(),
      action: async (admin: AdminApiContextWithRest, _session: Session) =>
        admin.graphql('{ shop { name } }'),
    },
    {
      testGroup: 'GraphQL client with options',
      mockRequest: mockGraphqlRequest('2021-01' as ApiVersion),
      action: async (admin: AdminApiContextWithRest, _session: Session) =>
        admin.graphql(
          'mutation myMutation($ID: String!) { shop(ID: $ID) { name } }',
          {
            variables: {ID: '123'},
            apiVersion: '2021-01' as ApiVersion,
            headers: {custom: 'header'},
            tries: 2,
          },
        ),
    },
  ])(
    '$testGroup re-authentication',
    ({testGroup: _testGroup, mockRequest, action}) => {
      it('throws a response when GraphQL request receives a non-401 response and not embedded', async () => {
        // GIVEN
        const {admin, session} = await setUpNonEmbeddedFlow();
        const requestMock = await mockRequest({status: 403});

        // WHEN
        const response = await getThrownResponse(
          async () => action(admin, session),
          requestMock,
        );

        // THEN
        expect(response.status).toEqual(403);
      });
    },
  );

  it('can parse a nested response object', async () => {
    const {admin, session} = await setUpEmbeddedFlow();

    const body = {
      product: {
        id: 12345,
        title: 'Product title',
        variants: [
          {
            id: 54321,
            product_id: 12345,
            title: 'Variant title',
            price: '34.02',
          },
        ],
        options: [
          {
            id: 54321,
            product_id: 12345,
            name: 'Title',
            position: 1,
            values: ['Option title'],
          },
        ],
        images: [],
        image: null,
      },
    };

    await mockRestRequest(200, 'products/12345.json', body);

    const resource = await admin.rest.resources.Product.find({
      session,
      id: 12345,
    });
    const variants = resource!.variants! as InstanceType<
      (typeof admin)['rest']['resources']['Variant']
    >[];

    expect(resource!.title).toBe('Product title');
    expect(variants[0].title).toBe('Variant title');
  });

  it('passes abort signal through to fetch request', async () => {
    // GIVEN
    const {admin} = await setUpEmbeddedFlow();
    const controller = new AbortController();

    // Mock the GraphQL response
    await mockGraphqlRequest()({
      status: 200,
      responseContent: JSON.stringify({data: {shop: {name: 'Test Shop'}}}),
    });

    // WHEN
    await admin.graphql('{ shop { name } }', {signal: controller.signal});

    // THEN - Verify fetch was called with the signal
    expect(fetchMock.mock.calls).toHaveLength(1);
    const [_url, options] = fetchMock.mock.calls[0];
    expect(options).toBeDefined();
    expect(options!.signal).toBe(controller.signal);
  });
});

async function mockRestRequest(
  status: number,
  path = 'customers.json',
  response = {},
) {
  const requestMock = new Request(
    `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/${path}`,
  );

  await mockExternalRequest({
    request: requestMock,
    response: new Response(JSON.stringify(response), {status}),
  });

  return requestMock;
}
