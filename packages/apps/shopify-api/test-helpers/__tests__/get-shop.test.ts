import {TEST_SHOP, TEST_SHOP_NAME} from '../const';
import {getShop} from '../get-shop';

describe('getShop', () => {
  it('can return a shop URL from a store name', () => {
    expect(getShop(TEST_SHOP_NAME)).toEqual(TEST_SHOP);
  });
});
