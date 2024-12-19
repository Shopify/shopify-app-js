import {APP_URL, TEST_SHOP} from '../../../__test-helpers';
import {getShopFromRequest} from '../get-shop-from-request';

describe('getShopFromRequest', () => {
  it('returns sanitized shop domain from request URL params', () => {
    // GIVEN
    const request = new Request(`${APP_URL}?shop=${TEST_SHOP}`);

    // WHEN
    const result = getShopFromRequest(request);

    // THEN
    expect(result).toBe(TEST_SHOP);
  });
});
