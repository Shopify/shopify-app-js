import {
  mockGraphqlRequests,
  setUpEmbeddedFlow,
  setUpFetchFlow,
} from '../../../../__test-helpers';

import * as responses from './mock-responses';

it('returns successfully revoked scopes', async () => {
  // GIVEN
  const {scopes} = await setUpEmbeddedFlow();
  await mockGraphqlRequests()({
    body: 'AppRevokeAccessScopes',
    responseContent: responses.REVOKED_WITHOUT_ERROR,
  });

  // WHEN
  const result = await scopes.revoke(['write_discounts', 'read_orders']);

  // THEN
  expect(result).not.toBeUndefined();
  expect(result.revoked).toEqual(['write_discounts', 'read_orders']);
});

it('returns successfully with empty list when graphql returns an empty list for the revoke operation', async () => {
  // GIVEN
  const {scopes} = await setUpEmbeddedFlow();
  await mockGraphqlRequests()({
    body: 'AppRevokeAccessScopes',
    responseContent: responses.REVOKED_NOTHING,
  });

  // WHEN
  const result = await scopes.revoke(['read_orders']);

  // THEN
  expect(result).not.toBeUndefined();
  expect(result.revoked).toEqual([]);
});

it('returns error if the list of scopes is empty', async () => {
  // GIVEN
  const {scopes} = await setUpEmbeddedFlow();

  // WHEN / THEN
  await expect(scopes.revoke([])).rejects.toEqual(
    expect.objectContaining({
      status: 400,
    }),
  );
});

it('returns revoke server errors', async () => {
  // GIVEN
  const {scopes} = await setUpEmbeddedFlow();
  await mockGraphqlRequests()({
    body: 'AppRevokeAccessScopes',
    responseContent: responses.REVOKED_WITH_ERROR,
  });

  // WHEN / THEN
  await expect(scopes.revoke(['invalid_scope'])).rejects.toEqual(
    expect.objectContaining({
      status: 422,
    }),
  );
});

it('return an unexpected error when there is no authentication error', async () => {
  // GIVEN
  const {scopes} = await setUpFetchFlow();
  await mockGraphqlRequests()({
    body: 'AppRevokeAccessScopes',
    status: 500,
  });

  // WHEN / THEN
  await expect(scopes.revoke(['read_orders'])).rejects.toEqual(
    expect.objectContaining({
      status: 500,
    }),
  );
});
