import {
  mockGraphqlRequest,
  setUpEmbeddedFlow,
  setUpFetchFlow,
} from '../../../../__test-helpers';

import * as responses from './mock-responses';

it('returns scopes information', async () => {
  // GIVEN
  const {scopes} = await setUpEmbeddedFlow();
  await mockGraphqlRequest()({
    status: 200,
    responseContent: responses.WITH_GRANTED_AND_DECLARED,
  });

  // WHEN
  const result = await scopes.query();
  // THEN
  expect(result).not.toBeUndefined();
  expect(result.granted).toEqual([
    'read_orders',
    'read_reports',
    'read_products',
    'read_customers',
    'write_customers',
  ]);
  expect(result.required).toEqual([
    'read_orders',
    'read_reports',
    'read_products',
  ]);
  expect(result.optional).toEqual(['write_customers', 'write_products']);
});

it('return an unexpected error when there is no authentication error', async () => {
  // GIVEN
  const {scopes} = await setUpFetchFlow();
  await mockGraphqlRequest()({status: 500});

  // WHEN / THEN
  await expect(scopes.query()).rejects.toEqual(
    expect.objectContaining({
      status: 500,
    }),
  );
});
