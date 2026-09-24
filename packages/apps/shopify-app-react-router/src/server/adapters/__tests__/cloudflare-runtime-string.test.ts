import {abstractRuntimeString} from '@shopify/shopify-api/runtime';

describe('cloudflare adapter runtime string', () => {
  it('identifies the runtime as React Router on Cloudflare Worker', async () => {
    // WHEN
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    await require('../cloudflare/index');

    // THEN
    expect(abstractRuntimeString()).toEqual('React Router (Cloudflare Worker)');
  });
});
