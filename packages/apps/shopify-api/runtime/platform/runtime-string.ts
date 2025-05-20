import {AbstractRuntimeStringFunc} from './types';

// eslint-disable-next-line import/no-mutable-exports
let _abstractRuntimeString: AbstractRuntimeStringFunc = () => {
  throw new Error(
    "Missing adapter implementation for 'abstractRuntimeString' – make sure to call `setAbstractRuntimeString()` with a platform-specific implementation.",
  );
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
