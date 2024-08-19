import {TEST_SHOP, TEST_SHOP_NAME} from '../const';
import {getShopValue} from '../get-shop-value';

describe('getShop', () => {
  it('can return a shop URL from a store name', () => {
    expect(getShopValue(TEST_SHOP_NAME)).toEqual(TEST_SHOP);
  });
});
