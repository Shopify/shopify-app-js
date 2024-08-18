/**
 * Creates a fake Base64Encoded host for the store name to use when faking authorization in testing.
 *
 * @param store The store name for which to create a fake Base64Encoded host to use when faking authorization in testing.
 * @returns A fake Base64Encoded host for the store name.
 */
export function getHostValue(store: string): string {
  return Buffer.from(`admin.shopify.com/store/${store}`).toString('base64');
}
