import {AbstractRuntimeStringFunc} from './types';

// eslint-disable-next-line import/no-mutable-exports
let _abstractRuntimeString: AbstractRuntimeStringFunc = () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'abstractRuntimeString() used without being set in production',
    );
  }

  return 'offline_shop_test-shop.myshopify.io';
};

// Mutable state managed internally via getters - For Nuxt and other SSR managed frameworks.
export function getAbstractRuntimeString(): AbstractRuntimeStringFunc {
  return _abstractRuntimeString;
}

export function setAbstractRuntimeString(
  func: AbstractRuntimeStringFunc,
): void {
  _abstractRuntimeString = func;
}
