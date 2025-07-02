import {ShopifyError} from '@shopify/shopify-api';

export async function getThrownError(
  callback: (request: Request) => Promise<any>,
  request: Request,
): Promise<ShopifyError> {
  try {
    await callback(request);
  } catch (error) {
    if (!(error instanceof ShopifyError)) {
      throw new Error(
        `${request.method} request to ${request.url} did not throw a ShopifyError.`,
      );
    }
    return error;
  }

  throw new Error(`${request.method} request to ${request.url} did not throw`);
}
